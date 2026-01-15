import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Get allowed origins from environment or use defaults
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "").split(",").filter(Boolean);

// Helper to get CORS headers based on request origin
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  // Allow if origin is in allowed list, or allow all if no restrictions configured
  const isAllowed = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : (ALLOWED_ORIGINS[0] || "*"),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

interface SendOtpRequest {
  email: string;
}

// Rate limiting: max 3 OTP requests per email per 15 minutes
const MAX_OTP_REQUESTS = 3;
const OTP_RATE_LIMIT_MINUTES = 15;

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOtpRequest = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "بريد إلكتروني غير صالح" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user exists with admin role
    const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
    const user = userData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // Check if user has admin role
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (!roleData) {
        return new Response(
          JSON.stringify({ error: "غير مصرح لهذا البريد الإلكتروني" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // New user - check if this is the first user (bootstrap scenario)
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      
      // Only allow if no admins exist yet (bootstrap) - otherwise reject
      if (count && count > 0) {
        return new Response(
          JSON.stringify({ error: "غير مصرح لهذا البريد الإلكتروني" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Rate limiting: Check recent OTP requests for this email
    const rateLimitTime = new Date(Date.now() - OTP_RATE_LIMIT_MINUTES * 60 * 1000).toISOString();
    const { data: recentOtps, error: countError } = await supabaseAdmin
      .from("admin_otp_codes")
      .select("id")
      .eq("email", email.toLowerCase())
      .gt("created_at", rateLimitTime);

    if (!countError && recentOtps && recentOtps.length >= MAX_OTP_REQUESTS) {
      return new Response(
        JSON.stringify({ error: `طلبات كثيرة. حاول مرة أخرى بعد ${OTP_RATE_LIMIT_MINUTES} دقيقة` }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTP codes for this email (keep rate limiting records until they expire naturally)
    await supabaseAdmin
      .from("admin_otp_codes")
      .delete()
      .eq("email", email.toLowerCase())
      .eq("used", true);

    // Insert new OTP
    const { error: insertError } = await supabaseAdmin
      .from("admin_otp_codes")
      .insert({
        email: email.toLowerCase(),
        code: otp,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (insertError) {
      console.error("Error inserting OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "فشل في إنشاء رمز التحقق" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email with OTP using fetch
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ÉLITE ZONE <onboarding@resend.dev>",
        to: [email],
        subject: "رمز التحقق - ÉLITE ZONE Admin",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #C4A052 0%, #E5C06E 100%); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ÉLITE ZONE</h1>
              <p style="color: white; margin: 10px 0 0; font-size: 14px;">مركز تكوين وتعليم اللغات</p>
            </div>
            <div style="background: #1a1a2e; padding: 40px; border-radius: 16px; margin-top: 20px; text-align: center;">
              <h2 style="color: #C4A052; margin: 0 0 20px;">رمز التحقق الخاص بك</h2>
              <div style="background: #2a2a4e; padding: 20px; border-radius: 12px; display: inline-block;">
                <span style="font-size: 36px; font-weight: bold; color: #C4A052; letter-spacing: 8px;">${otp}</span>
              </div>
              <p style="color: #888; margin-top: 30px; font-size: 14px;">
                هذا الرمز صالح لمدة 10 دقائق فقط
              </p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Error sending email:", errorData);
      return new Response(
        JSON.stringify({ error: "فشل في إرسال البريد الإلكتروني" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("OTP email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "تم إرسال رمز التحقق" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ في النظام" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
};

serve(handler);

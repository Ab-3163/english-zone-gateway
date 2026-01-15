import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use defaults
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "").split(",").filter(Boolean);

// Helper to get CORS headers based on request origin
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : (ALLOWED_ORIGINS[0] || "*"),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

interface VerifyOtpRequest {
  email: string;
  code: string;
  deviceId: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, deviceId }: VerifyOtpRequest = await req.json();

    // Validate input
    if (!email || !code || !deviceId) {
      return new Response(
        JSON.stringify({ error: "بيانات غير كاملة" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "بريد إلكتروني غير صالح" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "رمز التحقق غير صالح" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // First, get the current OTP record for this email (regardless of code match)
    const { data: currentOtp } = await supabaseAdmin
      .from("admin_otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Check if too many attempts (max 5 attempts)
    if (currentOtp && (currentOtp.attempts || 0) >= 5) {
      return new Response(
        JSON.stringify({ error: "عدد المحاولات كثير جداً. يرجى طلب رمز جديد" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check OTP code match
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from("admin_otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (otpError || !otpData) {
      // Increment attempt counter on failure
      if (currentOtp) {
        await supabaseAdmin
          .from("admin_otp_codes")
          .update({ attempts: (currentOtp.attempts || 0) + 1 })
          .eq("id", currentOtp.id);
      }
      
      return new Response(
        JSON.stringify({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as used
    await supabaseAdmin
      .from("admin_otp_codes")
      .update({ used: true })
      .eq("id", otpData.id);

    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let user = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    // Static password for admin (will only be used internally)
    const adminPassword = Deno.env.get("ADMIN_PASSWORD") || `Admin${crypto.randomUUID().slice(0, 8)}!1`;

    // Create user if not exists
    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        password: adminPassword,
      });

      if (createError || !newUser.user) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "فشل في إنشاء حساب المستخدم" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      user = newUser.user;

      // Assign admin role
      await supabaseAdmin.from("user_roles").insert({
        user_id: user.id,
        role: "admin",
      });
    } else {
      // Update password for existing user to ensure we can sign them in
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: adminPassword,
      });
    }

    // Verify user has admin role (server-side validation)
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      // User exists but no admin role - deny access
      return new Response(
        JSON.stringify({ error: "غير مصرح لهذا البريد الإلكتروني" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create 30-day session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Upsert session
    await supabaseAdmin
      .from("admin_sessions")
      .upsert(
        {
          user_id: user.id,
          device_id: deviceId,
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: "user_id,device_id" }
      );

    // Sign in the user and get access token
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: email,
      password: adminPassword,
    });

    if (signInError || !signInData.session) {
      console.error("Sign in error:", signInError);
      
      // Fallback: Generate magic link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      });

      if (linkError || !linkData) {
        console.error("Error generating link:", linkError);
        return new Response(
          JSON.stringify({ error: "فشل في إنشاء جلسة الدخول" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const url = new URL(linkData.properties.action_link);
      const token = url.searchParams.get("token");
      const type = url.searchParams.get("type");

      return new Response(
        JSON.stringify({ 
          success: true, 
          userId: user.id,
          sessionExpires: expiresAt.toISOString(),
          token,
          type,
          email,
          useMagicLink: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Return the session tokens directly
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: user.id,
        sessionExpires: expiresAt.toISOString(),
        accessToken: signInData.session.access_token,
        refreshToken: signInData.session.refresh_token,
        email,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ في النظام" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
};

serve(handler);

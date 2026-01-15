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

interface CheckSessionRequest {
  deviceId: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ valid: false, error: "غير مصرح" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ valid: false, error: "جلسة غير صالحة" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;
    const { deviceId }: CheckSessionRequest = await req.json();

    // Validate deviceId
    if (!deviceId || typeof deviceId !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "معرف الجهاز غير صالح" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create admin client for checking session
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user has admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ valid: false, error: "ليس لديك صلاحيات الأدمن" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if device session is valid
    const { data: sessionData } = await supabaseAdmin
      .from("admin_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("device_id", deviceId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!sessionData) {
      return new Response(
        JSON.stringify({ valid: false, requireOtp: true, error: "الجلسة منتهية، يرجى إعادة التحقق" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        valid: true, 
        userId,
        sessionExpires: sessionData.expires_at,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in check-admin-session function:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "حدث خطأ في النظام" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
};

serve(handler);

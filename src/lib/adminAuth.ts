import { supabase } from "@/integrations/supabase/client";

const DEVICE_ID_KEY = "admin_device_id";
const SESSION_KEY = "admin_session_info";
const OTP_COOLDOWN_KEY = "otp_last_request";
const OTP_COOLDOWN_SECONDS = 60; // 60 seconds cooldown between OTP requests

// Generate or get device ID
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// Check OTP cooldown
const checkOtpCooldown = (): { canSend: boolean; remainingSeconds: number } => {
  const lastRequest = localStorage.getItem(OTP_COOLDOWN_KEY);
  if (!lastRequest) {
    return { canSend: true, remainingSeconds: 0 };
  }
  
  const elapsed = (Date.now() - parseInt(lastRequest)) / 1000;
  if (elapsed < OTP_COOLDOWN_SECONDS) {
    return { canSend: false, remainingSeconds: Math.ceil(OTP_COOLDOWN_SECONDS - elapsed) };
  }
  
  return { canSend: true, remainingSeconds: 0 };
};

// Send OTP to admin email (email validated server-side against user_roles table)
export const sendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
  // Client-side rate limiting
  const cooldown = checkOtpCooldown();
  if (!cooldown.canSend) {
    return { 
      success: false, 
      error: `انتظر ${cooldown.remainingSeconds} ثانية قبل إعادة المحاولة` 
    };
  }

  // Validate email format client-side
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, error: "بريد إلكتروني غير صالح" };
  }

  try {
    // Record OTP request time before sending
    localStorage.setItem(OTP_COOLDOWN_KEY, Date.now().toString());

    const response = await supabase.functions.invoke("send-otp", {
      body: { email },
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    if (response.data?.error) {
      return { success: false, error: response.data.error };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Verify OTP and create session
export const verifyOtp = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const deviceId = getDeviceId();
    
    const response = await supabase.functions.invoke("verify-otp", {
      body: { email, code, deviceId },
    });

    // Handle edge function errors - try to extract error from response data first
    if (response.error) {
      console.error("Edge function error:", response.error);
      // The error message from the edge function is in response.data
      const errorMsg = response.data?.error || "رمز التحقق غير صحيح أو منتهي الصلاحية";
      return { success: false, error: errorMsg };
    }

    // Handle application-level errors returned in data
    if (response.data?.error) {
      return { success: false, error: response.data.error };
    }

    // Check if we have success response
    if (!response.data?.success) {
      return { success: false, error: response.data?.error || "فشل في التحقق من الرمز" };
    }

    // If we got access token directly, set the session
    if (response.data?.accessToken && response.data?.refreshToken) {
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: response.data.accessToken,
        refresh_token: response.data.refreshToken,
      });

      if (setSessionError) {
        console.error("Set session error:", setSessionError);
      }
    }
    // Fallback: Use magic link token
    else if (response.data?.token && response.data?.type && response.data?.useMagicLink) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: response.data.token,
        type: response.data.type,
      });

      if (verifyError) {
        console.error("Verify OTP error:", verifyError);
      }
    }

    // Store session info
    if (response.data?.sessionExpires && response.data?.userId) {
      const sessionData = {
        expires: response.data.sessionExpires,
        deviceId,
        userId: response.data.userId,
        email: email.toLowerCase(),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }

    return { success: true };
  } catch (error: any) {
    console.error("Verify OTP catch error:", error);
    return { success: false, error: "حدث خطأ في التحقق من الرمز" };
  }
};

// Check if admin session is valid
export const checkAdminSession = async (): Promise<{ valid: boolean; requireOtp?: boolean }> => {
  try {
    // First check Supabase auth session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Check if user has admin role (server-side validation)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        // Check local session expiry
        const sessionInfo = localStorage.getItem(SESSION_KEY);
        if (sessionInfo) {
          const parsed = JSON.parse(sessionInfo);
          const expiresAt = new Date(parsed.expires);
          
          if (expiresAt > new Date()) {
            return { valid: true, requireOtp: false };
          }
        }
        
        // Session in Supabase but local expired - still valid if Supabase session is valid
        return { valid: true, requireOtp: false };
      }
    }

    // Check local session as fallback
    const sessionInfo = localStorage.getItem(SESSION_KEY);
    if (!sessionInfo) {
      return { valid: false, requireOtp: true };
    }

    const parsed = JSON.parse(sessionInfo);
    
    // Check required fields
    if (!parsed.expires || !parsed.userId || !parsed.deviceId) {
      localStorage.removeItem(SESSION_KEY);
      return { valid: false, requireOtp: true };
    }

    const expiresAt = new Date(parsed.expires);
    
    // Check if session expired
    if (expiresAt < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return { valid: false, requireOtp: true };
    }

    // Try to refresh the session if we have one stored
    const { data: refreshData } = await supabase.auth.refreshSession();
    if (refreshData.session) {
      return { valid: true, requireOtp: false };
    }

    // Local session is valid but no Supabase session - need re-auth
    return { valid: false, requireOtp: true };
  } catch (error) {
    console.error("Session check error:", error);
    return { valid: false, requireOtp: true };
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem(SESSION_KEY);
};

// Check if user is admin (based on local session)
export const isAdmin = async (): Promise<boolean> => {
  const { valid } = await checkAdminSession();
  return valid;
};

// Get stored session info
export const getSessionInfo = (): { userId: string; email: string; expires: string } | null => {
  try {
    const sessionInfo = localStorage.getItem(SESSION_KEY);
    if (!sessionInfo) return null;
    return JSON.parse(sessionInfo);
  } catch {
    return null;
  }
};

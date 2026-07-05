import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PHONE = "22236423111";
const WHATSLOOP_URL = "https://elite-zone.whatsloop.net/api/v1/message/send-text";

interface Payload {
  full_name?: string;
  phone?: string;
  course?: string;
  language?: string;
  level?: string;
  age?: number | string | null;
  preferred_time?: string | null;
  created_at?: string;
}

const labelLang = (v?: string | null) =>
  v === "french" ? "الفرنسية" : v === "english" ? "الإنجليزية" : v === "arabic" ? "العربية" : (v || "-");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  console.log("WhatsApp notification started");

  try {
    const token = Deno.env.get("WHATSLOOP_API_TOKEN");
    if (!token) {
      console.error("WHATSLOOP_API_TOKEN not configured");
      console.error("WhatsApp notification failed: missing token");
      return new Response(JSON.stringify({ success: false, error: "token_missing" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Payload = await req.json().catch(() => ({}));
    const course = body.course || labelLang(body.language);
    const createdAt = body.created_at
      ? new Date(body.created_at).toLocaleString("ar")
      : new Date().toLocaleString("ar");

    const message =
      `🔔 طلب تسجيل جديد\n\n` +
      `الاسم: ${body.full_name || "-"}\n` +
      `الهاتف: ${body.phone || "-"}\n` +
      `الدورة: ${course}\n` +
      `المستوى: ${body.level || "-"}\n` +
      `العمر: ${body.age ?? "-"}\n` +
      `الوقت المناسب: ${body.preferred_time || "-"}\n` +
      `تاريخ التسجيل: ${createdAt}\n\n` +
      `افتح لوحة الإدارة لمراجعة إيصال الدفع.`;

    const resp = await fetch(WHATSLOOP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-API-KEY": token,
      },
      body: JSON.stringify({
        phone: ADMIN_PHONE,
        message,
      }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error("WhatsApp notification failed:", resp.status, text);
      return new Response(JSON.stringify({ success: false, status: resp.status, response: text }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("WhatsApp notification sent successfully", text);
    return new Response(JSON.stringify({ success: true, response: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("WhatsApp notification failed:", e?.message || e);
    return new Response(JSON.stringify({ success: false, error: e?.message || String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const KAPSO_BASE = Deno.env.get("KAPSO_BASE_URL") || "https://api.kapso.ai/meta/whatsapp/v24.0";
const DEFAULT_ADMIN = Deno.env.get("ADMIN_WHATSAPP_NUMBER") || "22236423111";
const PHONE_NUMBER_ID = Deno.env.get("KAPSO_PHONE_NUMBER_ID") || "597907523413541";

type MessageType =
  | "registration"
  | "acceptance"
  | "invoice"
  | "certificate"
  | "result"
  | "custom";

interface Payload {
  type?: MessageType;
  to?: string; // destination phone (defaults to admin)
  message?: string; // for custom
  document_url?: string; // pdf link (invoice/certificate)
  document_name?: string;
  caption?: string;
  // registration/acceptance/result placeholders
  full_name?: string;
  phone?: string;
  age?: number | string | null;
  language?: string;
  level?: string;
  center?: string;
  course_type?: string;
  student_id?: string;
  course?: string;
  score?: number | string;
  grade?: string;
  created_at?: string;
}

const labelLang = (v?: string | null) =>
  v === "french" ? "الفرنسية" : v === "english" ? "الإنجليزية" : v === "arabic" ? "العربية" : (v || "-");

const labelCourseType = (v?: string | null) =>
  v === "in_person" ? "حضورية" : v === "online" ? "أونلاين" : (v || "-");

const labelCenter = (v?: string | null) =>
  v === "nouakchott" ? "نواكشوط" : v === "tensoueilim" ? "تنسويلم" : (v || "-");

function buildBody(p: Payload): { to: string; body: Record<string, unknown> } {
  const to = (p.to || DEFAULT_ADMIN).replace(/[^\d]/g, "");
  const type = p.type || "registration";

  let text = "";
  switch (type) {
    case "registration":
      text =
        `🔔 طالب جديد قام بالتسجيل.\n\n` +
        `الاسم: ${p.full_name || "-"}\n` +
        `الهاتف: ${p.phone || "-"}\n` +
        `العمر: ${p.age ?? "-"}\n` +
        `اللغة: ${labelLang(p.language)}\n` +
        `المستوى: ${p.level || "-"}\n` +
        `المركز: ${labelCenter(p.center)}\n` +
        `نوع الدورة: ${labelCourseType(p.course_type)}\n` +
        `تاريخ التسجيل: ${new Date(p.created_at || Date.now()).toLocaleString("ar")}`;
      break;
    case "acceptance":
      text =
        `✅ مرحباً ${p.full_name || ""}،\n` +
        `تم قبول تسجيلك في ÉLITE ZONE.\n\n` +
        `رقم الطالب: ${p.student_id || "-"}\n` +
        `المستوى: ${p.level || "-"}\n` +
        `المركز: ${labelCenter(p.center)}\n\n` +
        `يمكنك الآن الدخول إلى بوابة الطالب.`;
      break;
    case "result":
      text =
        `📊 نتيجة ${p.full_name || ""}\n` +
        `رقم الطالب: ${p.student_id || "-"}\n` +
        `الدورة: ${p.course || "-"} - ${p.level || ""}\n` +
        `الدرجة: ${p.score ?? "-"}\n` +
        `التقدير: ${p.grade || "-"}`;
      break;
    case "invoice":
    case "certificate": {
      const caption =
        p.caption ||
        (type === "invoice"
          ? `فاتورة التسجيل - ${p.full_name || ""}`
          : `شهادة - ${p.full_name || ""}`);
      if (!p.document_url) throw new Error("document_url required");
      return {
        to,
        body: {
          messaging_product: "whatsapp",
          to,
          type: "document",
          document: {
            link: p.document_url,
            filename: p.document_name || (type === "invoice" ? "invoice.pdf" : "certificate.pdf"),
            caption,
          },
        },
      };
    }
    case "custom":
      text = p.message || "";
      break;
  }

  return {
    to,
    body: {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("KAPSO_API_KEY");
    if (!apiKey) {
      console.error("send-whatsapp: KAPSO_API_KEY not configured");
      return new Response(JSON.stringify({ success: false, error: "api_key_missing" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: Payload = await req.json().catch(() => ({}));
    const { to, body } = buildBody(payload);

    const url = `${KAPSO_BASE}/${PHONE_NUMBER_ID}/messages`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error("send-whatsapp: send failed", resp.status, text);
      return new Response(
        JSON.stringify({ success: false, status: resp.status, response: text }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("send-whatsapp: sent to", to);
    return new Response(JSON.stringify({ success: true, response: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("send-whatsapp: exception", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
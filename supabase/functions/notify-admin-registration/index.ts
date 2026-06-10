import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  student_id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  language?: string | null;
  level?: string | null;
  course_type?: string | null;
  preferred_time?: string | null;
  has_receipt?: boolean;
}

const labelLang = (v?: string | null) =>
  v === "french" ? "الفرنسية" : v === "english" ? "الإنجليزية" : v === "arabic" ? "العربية" : (v || "-");
const labelType = (v?: string | null) =>
  v === "in_person" ? "حضورية" : v === "online" ? "أونلاين" : (v || "-");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: Payload = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Save a notification record
    await supabaseAdmin.from("admin_notifications").insert({
      type: "new_registration",
      title: `تسجيل جديد: ${body.full_name}`,
      body: `Student ID: ${body.student_id} — ${body.phone}`,
      metadata: body as any,
    });

    // Find admin emails
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminEmails: string[] = [];
    if (roles && roles.length) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const adminIds = new Set(roles.map((r) => r.user_id));
      for (const u of users?.users || []) {
        if (u.email && adminIds.has(u.id)) adminEmails.push(u.email);
      }
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;
    if (RESEND_API_KEY && adminEmails.length > 0) {
      const adminLink = "https://www.elitezone.center/admin";
      const html = `
        <div dir="rtl" style="font-family:Cairo,Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#dc2626;border-bottom:2px solid #dc2626;padding-bottom:8px">📢 تسجيل طالب جديد في ÉLITE ZONE</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#fff;border-radius:8px;overflow:hidden">
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>🆔 Student ID:</b></td><td style="padding:10px;border-bottom:1px solid #eee">${body.student_id}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>👤 الاسم:</b></td><td style="padding:10px;border-bottom:1px solid #eee">${body.full_name}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>📞 الهاتف:</b></td><td style="padding:10px;border-bottom:1px solid #eee" dir="ltr">${body.phone}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>📧 البريد:</b></td><td style="padding:10px;border-bottom:1px solid #eee">${body.email || "-"}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>🌐 اللغة:</b></td><td style="padding:10px;border-bottom:1px solid #eee">${labelLang(body.language)}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>📚 المستوى:</b></td><td style="padding:10px;border-bottom:1px solid #eee">${body.level || "-"}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>🏫 نوع الدورة:</b></td><td style="padding:10px;border-bottom:1px solid #eee">${labelType(body.course_type)}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>⏰ الوقت المناسب:</b></td><td style="padding:10px;border-bottom:1px solid #eee">${body.preferred_time || "-"}</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #eee"><b>💰 حالة الدفع:</b></td><td style="padding:10px;border-bottom:1px solid #eee">بانتظار التأكيد</td></tr>
            <tr><td style="padding:10px"><b>🧾 وصل الدفع:</b></td><td style="padding:10px">${body.has_receipt ? "✅ تم الرفع" : "❌ لم يتم الرفع"}</td></tr>
          </table>
          <div style="margin-top:24px;text-align:center">
            <a href="${adminLink}" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">🔗 افتح لوحة الإدارة لتأكيد الدفع</a>
          </div>
        </div>
      `;

      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "ÉLITE ZONE <onboarding@resend.dev>",
            to: adminEmails,
            subject: `📢 تسجيل طالب جديد: ${body.full_name} (${body.student_id})`,
            html,
          }),
        });
        emailSent = resp.ok;
        if (!resp.ok) console.error("Resend error:", await resp.text());
      } catch (e) {
        console.error("Email send failed:", e);
      }
    }

    return new Response(JSON.stringify({ success: true, emailSent, recipients: adminEmails.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("notify-admin-registration error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
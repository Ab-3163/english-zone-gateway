import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  // Mauritania default country code
  if (cleaned.length === 8) return "222" + cleaned;
  return cleaned;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { student_id } = await req.json();
    if (!student_id) {
      return new Response(JSON.stringify({ error: "student_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = Deno.env.get("WHATSLOOP_API_TOKEN");
    if (!token) throw new Error("WHATSLOOP_API_TOKEN missing");

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: student, error: sErr } = await supabase
      .from("students")
      .select("id, student_id, full_name, phone, invoice_number, invoice_pdf_url")
      .eq("id", student_id)
      .maybeSingle();

    if (sErr || !student) throw new Error("Student not found");
    if (!student.invoice_pdf_url) throw new Error("Invoice not generated yet");

    // Create fresh 24h signed URL for delivery
    const { data: signed, error: signErr } = await supabase.storage
      .from("invoices")
      .createSignedUrl(student.invoice_pdf_url, 60 * 60 * 24 * 7);
    if (signErr || !signed?.signedUrl) throw new Error("Failed to sign invoice URL");

    const phone = normalizePhone(student.phone);
    const caption =
      `مرحباً ${student.full_name}،\n` +
      `تم تأكيد دفع رسوم التسجيل بنجاح.\n` +
      `مرفق لكم فاتورة التسجيل الخاصة بكم.\n\n` +
      `رقم الطالب: ${student.student_id}\n\n` +
      `يرجى الاحتفاظ بهذا الرقم للدخول إلى بوابة الطالب ومتابعة النتائج.\n\n` +
      `ÉLITE ZONE`;

    // WhatsLoop: send file/document
    const resp = await fetch("https://elite-zone.whatsloop.net/api/v1/message/send-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Token": token,
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        receiver: phone,
        phone,
        to: phone,
        fileLink: signed.signedUrl,
        file: signed.signedUrl,
        url: signed.signedUrl,
        fileName: `invoice-${student.student_id}.pdf`,
        caption,
        message: caption,
        type: "document",
      }),
    });

    const bodyText = await resp.text();
    let bodyJson: any = null;
    try { bodyJson = JSON.parse(bodyText); } catch { bodyJson = { raw: bodyText }; }

    const ok = resp.ok && (bodyJson?.status !== false);

    await supabase.from("invoice_logs").insert({
      student_id: student.id,
      invoice_number: student.invoice_number,
      channel: "whatsapp",
      status: ok ? "sent" : "failed",
      phone,
      provider_response: bodyJson,
      error_message: ok ? null : bodyText.slice(0, 500),
    });

    if (ok) {
      await supabase.from("students").update({
        invoice_status: "sent",
        invoice_sent_at: new Date().toISOString(),
      }).eq("id", student.id);
    }

    return new Response(JSON.stringify({ success: ok, response: bodyJson }), {
      status: ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-invoice-whatsapp error", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
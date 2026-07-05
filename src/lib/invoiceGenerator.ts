import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.jpeg";

export interface InvoiceStudent {
  id: string;
  student_id: string;
  invoice_number: string | null;
  full_name: string;
  phone: string;
  language: string | null;
  level: string | null;
  group_name: string | null;
  course_type: string | null;
  paid_amount: number | null;
  course_fee: number | null;
  payment_method: string | null;
  payment_confirmed_at: string | null;
}

const LANG_LABEL: Record<string, string> = {
  english: "الإنجليزية",
  french: "الفرنسية",
  arabic: "العربية",
  informatics: "المعلوماتية",
};

function buildHtml(s: InvoiceStudent, logoSrc: string): string {
  const date = new Date(s.payment_confirmed_at || Date.now()).toLocaleDateString("ar-EG");
  const lang = LANG_LABEL[s.language || ""] || s.language || "—";
  const amount = s.paid_amount ?? s.course_fee ?? 0;
  return `
  <div style="width:800px; padding:48px; background:#fff; color:#111827; font-family:'Cairo',system-ui,Arial; direction:rtl;">
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #EF4444; padding-bottom:20px; margin-bottom:28px;">
      <div>
        <div style="font-size:32px; font-weight:900; color:#0B1F4D; letter-spacing:1px;">ÉLITE ZONE</div>
        <div style="color:#6B7280; font-size:14px; margin-top:4px;">مركز التميّز للتكوين واللغات</div>
      </div>
      <img src="${logoSrc}" style="height:80px; width:80px; object-fit:cover; border-radius:12px;" crossorigin="anonymous" />
    </div>

    <div style="display:flex; justify-content:space-between; margin-bottom:24px;">
      <div>
        <div style="font-size:22px; font-weight:800; color:#0B1F4D;">فاتورة تسجيل</div>
        <div style="color:#6B7280; font-size:13px; margin-top:4px;">Registration Invoice</div>
      </div>
      <div style="text-align:left;">
        <div style="font-size:13px; color:#6B7280;">رقم الفاتورة</div>
        <div style="font-size:16px; font-weight:700; color:#111827;" dir="ltr">${s.invoice_number || "-"}</div>
        <div style="font-size:13px; color:#6B7280; margin-top:8px;">التاريخ</div>
        <div style="font-size:15px; color:#111827;">${date}</div>
      </div>
    </div>

    <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:20px; margin-bottom:20px;">
      <div style="font-weight:800; color:#0B1F4D; margin-bottom:12px; font-size:15px;">بيانات الطالب</div>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr><td style="padding:6px 0; color:#6B7280; width:35%;">رقم الطالب</td><td style="font-weight:700;" dir="ltr">${s.student_id}</td></tr>
        <tr><td style="padding:6px 0; color:#6B7280;">الاسم الكامل</td><td style="font-weight:700;">${s.full_name}</td></tr>
        <tr><td style="padding:6px 0; color:#6B7280;">رقم الهاتف</td><td dir="ltr">${s.phone}</td></tr>
      </table>
    </div>

    <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:20px; margin-bottom:20px;">
      <div style="font-weight:800; color:#0B1F4D; margin-bottom:12px; font-size:15px;">تفاصيل التسجيل</div>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr><td style="padding:6px 0; color:#6B7280; width:35%;">الدورة</td><td>${lang}</td></tr>
        <tr><td style="padding:6px 0; color:#6B7280;">المستوى</td><td>${s.level || "—"}</td></tr>
        <tr><td style="padding:6px 0; color:#6B7280;">القسم</td><td>${s.group_name || "—"}</td></tr>
        <tr><td style="padding:6px 0; color:#6B7280;">نوع الدراسة</td><td>${s.course_type === "online" ? "أونلاين" : "حضوري"}</td></tr>
      </table>
    </div>

    <div style="background:linear-gradient(135deg,#0B1F4D,#1e3a8a); color:#fff; border-radius:12px; padding:22px; margin-bottom:20px;">
      <table style="width:100%; font-size:14px;">
        <tr>
          <td style="opacity:.85;">طريقة الدفع</td>
          <td style="text-align:left; font-weight:700;">${s.payment_method || "نقدًا"}</td>
        </tr>
        <tr>
          <td style="opacity:.85; padding-top:8px;">حالة الدفع</td>
          <td style="text-align:left; padding-top:8px;">
            <span style="background:#10B981; padding:4px 12px; border-radius:999px; font-weight:800; font-size:12px;">✓ تم الدفع</span>
          </td>
        </tr>
        <tr>
          <td style="opacity:.85; padding-top:14px; font-size:15px;">المبلغ المدفوع</td>
          <td style="text-align:left; padding-top:14px; font-weight:900; font-size:22px;">${amount} MRU</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center; color:#6B7280; font-size:12px; border-top:1px solid #E5E7EB; padding-top:16px; margin-top:24px;">
      شكرًا لثقتكم في ÉLITE ZONE · هذه الفاتورة صالحة كإثبات دفع رسمي
    </div>
  </div>`;
}

async function loadImageAsDataUrl(src: string): Promise<string> {
  const res = await fetch(src);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function generateAndUploadInvoice(student: InvoiceStudent): Promise<{ path: string; url: string }> {
  const logoData = await loadImageAsDataUrl(logo);
  const html = buildHtml(student, logoData);

  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.top = "-10000px";
  holder.style.left = "0";
  holder.innerHTML = html;
  document.body.appendChild(holder);

  try {
    const target = holder.firstElementChild as HTMLElement;
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const finalHeight = Math.min(imgHeight, pageHeight - 40);
    pdf.addImage(imgData, "JPEG", 20, 20, imgWidth, finalHeight);

    const blob = pdf.output("blob");
    const path = `invoice-${student.student_id}-${Date.now()}.pdf`;

    const { error: upErr } = await supabase.storage.from("invoices").upload(path, blob, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (upErr) throw upErr;

    const { data: signed } = await supabase.storage.from("invoices").createSignedUrl(path, 60 * 60 * 24 * 30);
    return { path, url: signed?.signedUrl || "" };
  } finally {
    holder.remove();
  }
}
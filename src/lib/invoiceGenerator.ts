import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
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

function buildHtml(s: InvoiceStudent, logoSrc: string, qrSrc: string): string {
  const date = new Date(s.payment_confirmed_at || Date.now()).toLocaleDateString("ar-EG");
  const lang = LANG_LABEL[s.language || ""] || s.language || "—";
  const paid = s.paid_amount ?? 0;
  const fee = s.course_fee ?? paid;
  const remaining = Math.max(0, fee - paid);
  return `
  const rowStyle = "border-bottom:1px solid #EEF2F7;";
  const labelStyle = "padding:9px 12px; color:#6B7280; font-size:13px; width:38%; background:#FAFBFC;";
  const valueStyle = "padding:9px 12px; color:#0F172A; font-size:14px; font-weight:600;";
  const sectionTitle = "display:flex; align-items:center; gap:8px; font-weight:800; color:#0B1F4D; font-size:14px; margin:0 0 10px; padding-bottom:6px; border-bottom:2px solid #EF4444; width:fit-content;";
  return `
  <div style="width:794px; min-height:1123px; padding:36px 40px; background:#fff; color:#0F172A; font-family:'Cairo','Tajawal',system-ui,Arial; direction:rtl; box-sizing:border-box; position:relative;">
    <!-- HEADER -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #0B1F4D; padding-bottom:16px; margin-bottom:18px;">
      <div style="display:flex; align-items:center; gap:14px;">
        <img src="${logoSrc}" style="height:72px; width:72px; object-fit:cover; border-radius:12px; border:2px solid #EF4444;" crossorigin="anonymous" />
        <div>
          <div style="font-size:26px; font-weight:900; color:#0B1F4D; letter-spacing:1px; line-height:1;">ÉLITE ZONE</div>
          <div style="color:#0B1F4D; font-size:13px; margin-top:4px; font-weight:700;">مركز التميّز للتكوين واللغات</div>
          <div style="color:#6B7280; font-size:11px; margin-top:2px;">Centre d'Excellence pour la Formation et les Langues</div>
        </div>
      </div>
      <div style="text-align:left; background:linear-gradient(135deg,#0B1F4D,#1e40af); color:#fff; padding:12px 16px; border-radius:10px; min-width:200px;">
        <div style="font-size:15px; font-weight:900; letter-spacing:.5px;">📄 فاتورة تسجيل</div>
        <div style="font-size:10px; opacity:.85; margin-top:2px;">REGISTRATION INVOICE</div>
        <div style="border-top:1px solid rgba(255,255,255,.25); margin-top:8px; padding-top:8px;">
          <div style="font-size:10px; opacity:.75;">رقم الفاتورة</div>
          <div style="font-size:14px; font-weight:800;" dir="ltr">${s.invoice_number || "—"}</div>
          <div style="font-size:10px; opacity:.75; margin-top:6px;">التاريخ</div>
          <div style="font-size:12px; font-weight:600;">${date}</div>
        </div>
      </div>
    </div>

    <!-- STUDENT ID HIGHLIGHT -->
    <div style="display:flex; align-items:center; justify-content:space-between; background:#FEF2F2; border:1px solid #FECACA; border-right:5px solid #EF4444; border-radius:10px; padding:12px 16px; margin-bottom:16px;">
      <div style="color:#7F1D1D; font-size:13px; font-weight:700;">🎓 رقم الطالب</div>
      <div style="color:#0B1F4D; font-size:22px; font-weight:900; letter-spacing:3px;" dir="ltr">${s.student_id}</div>
    </div>

    <!-- STUDENT INFO -->
    <div style="margin-bottom:16px;">
      <div style="${sectionTitle}"><span>👤</span> بيانات الطالب</div>
      <table style="width:100%; border-collapse:collapse; border:1px solid #E5E7EB; border-radius:8px; overflow:hidden;">
        <tr style="${rowStyle}"><td style="${labelStyle}">الاسم الكامل</td><td style="${valueStyle}">${s.full_name}</td></tr>
        <tr style="${rowStyle}"><td style="${labelStyle}">رقم الهاتف</td><td style="${valueStyle}" dir="ltr">${s.phone}</td></tr>
        <tr style="${rowStyle}"><td style="${labelStyle}">اللغة / الدورة</td><td style="${valueStyle}">${lang}</td></tr>
        <tr style="${rowStyle}"><td style="${labelStyle}">المستوى</td><td style="${valueStyle}">${s.level || "—"}</td></tr>
        <tr style="${rowStyle}"><td style="${labelStyle}">القسم</td><td style="${valueStyle}">${s.group_name || "—"}</td></tr>
        <tr><td style="${labelStyle}">نوع الدراسة</td><td style="${valueStyle}">${s.course_type === "online" ? "أونلاين" : "حضوري"}</td></tr>
      </table>
    </div>

    <!-- PAYMENT INFO -->
    <div style="margin-bottom:16px;">
      <div style="${sectionTitle}"><span>💳</span> تفاصيل الدفع</div>
      <table style="width:100%; border-collapse:collapse; border:1px solid #E5E7EB; border-radius:8px; overflow:hidden;">
        <tr style="${rowStyle}"><td style="${labelStyle}">قيمة الرسوم</td><td style="${valueStyle}" dir="ltr">${fee} MRU</td></tr>
        <tr style="${rowStyle}"><td style="${labelStyle}">المبلغ المدفوع</td><td style="${valueStyle}color:#059669;" dir="ltr">${paid} MRU</td></tr>
        <tr style="${rowStyle}"><td style="${labelStyle}">المتبقي</td><td style="${valueStyle}color:${remaining>0?'#DC2626':'#059669'};" dir="ltr">${remaining} MRU</td></tr>
        <tr style="${rowStyle}"><td style="${labelStyle}">طريقة الدفع</td><td style="${valueStyle}">${s.payment_method || "نقدًا"}</td></tr>
        <tr><td style="${labelStyle}">حالة الدفع</td><td style="padding:9px 12px;"><span style="background:#10B981; color:#fff; padding:4px 12px; border-radius:999px; font-weight:800; font-size:11px;">✓ تم الدفع</span></td></tr>
      </table>
    </div>

    <!-- TOTAL + QR -->
    <div style="display:flex; gap:14px; margin-bottom:20px; align-items:stretch;">
      <div style="flex:1; background:linear-gradient(135deg,#0B1F4D,#1e3a8a); color:#fff; border-radius:12px; padding:18px 20px; display:flex; flex-direction:column; justify-content:center;">
        <div style="font-size:12px; opacity:.85;">إجمالي المدفوع</div>
        <div style="font-size:32px; font-weight:900; margin-top:4px;" dir="ltr">${paid} <span style="font-size:16px; opacity:.85;">MRU</span></div>
        <div style="font-size:11px; opacity:.75; margin-top:6px;">فاتورة صالحة كإثبات دفع رسمي</div>
      </div>
      <div style="width:130px; background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:8px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <img src="${qrSrc}" style="width:110px; height:110px;" />
        <div style="font-size:9px; color:#6B7280; margin-top:2px;">تحقق من الفاتورة</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="border-top:2px solid #0B1F4D; padding-top:12px; margin-top:auto;">
      <div style="text-align:center; color:#0B1F4D; font-size:13px; font-weight:800; margin-bottom:8px;">
        شكراً لاختياركم ÉLITE ZONE · نتمنى لكم التوفيق والنجاح
      </div>
      <div style="display:flex; justify-content:space-around; color:#6B7280; font-size:11px; flex-wrap:wrap; gap:8px;">
        <div>📍 نواكشوط، موريتانيا</div>
        <div dir="ltr">📞 +222 20 45 45 30</div>
        <div dir="ltr">✉ contact@elitezone.center</div>
        <div dir="ltr">🌐 www.elitezone.center</div>
      </div>
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
  const verifyUrl = `https://www.elitezone.center/verify?inv=${encodeURIComponent(student.invoice_number || "")}&sid=${encodeURIComponent(student.student_id)}`;
  const qrData = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 240, color: { dark: "#0B1F4D", light: "#FFFFFF" } });
  const html = buildHtml(student, logoData, qrData);

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
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const finalHeight = Math.min(imgHeight, pageHeight);
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, finalHeight);

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
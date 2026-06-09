import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Setting {
  id: string;
  key: string;
  value: string;
}

const SettingsManager = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    default_course_price: "",
    whatsapp_number: "+22220454530",
    site_title: "ÉLITE ZONE",
    google_maps_embed_url: "",
    google_maps_direct_link: "",
    center_address: "",
    center_phone: "",
    center_whatsapp: "+22220454530",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("settings").select("*");

    if (!error && data) {
      const settingsObj: Record<string, string> = { ...settings };
      data.forEach((s) => {
        settingsObj[s.key] = s.value;
      });
      setSettings(settingsObj);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    for (const [key, value] of Object.entries(settings)) {
      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("settings")
          .update({ value })
          .eq("key", key);
      } else {
        await supabase
          .from("settings")
          .insert({ key, value });
      }
    }

    setSaving(false);
    toast({
      title: "تم",
      description: "تم حفظ الإعدادات بنجاح",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">اسم الموقع</label>
          <Input
            value={settings.site_title}
            onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
            placeholder="ÉLITE ZONE"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">رقم الواتساب</label>
          <Input
            value={settings.whatsapp_number}
            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
            placeholder="+22220454530"
            dir="ltr"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">السعر الافتراضي للدورات (أوقية)</label>
          <Input
            type="number"
            value={settings.default_course_price}
            onChange={(e) => setSettings({ ...settings, default_course_price: e.target.value })}
            placeholder="5000"
            dir="ltr"
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold mb-3">معلومات الموقع والخريطة</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">عنوان المركز</label>
              <Input
                value={settings.center_address}
                onChange={(e) => setSettings({ ...settings, center_address: e.target.value })}
                placeholder="نواكشوط، موريتانيا"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
              <Input
                value={settings.center_phone}
                onChange={(e) => setSettings({ ...settings, center_phone: e.target.value })}
                placeholder="+222..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">رقم الواتساب (الموقع)</label>
              <Input
                value={settings.center_whatsapp}
                onChange={(e) => setSettings({ ...settings, center_whatsapp: e.target.value })}
                placeholder="+222..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Google Maps Embed URL</label>
              <Input
                value={settings.google_maps_embed_url}
                onChange={(e) => setSettings({ ...settings, google_maps_embed_url: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">من Google Maps → مشاركة → تضمين خريطة → انسخ src فقط</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Google Maps Direct Link</label>
              <Input
                value={settings.google_maps_direct_link}
                onChange={(e) => setSettings({ ...settings, google_maps_direct_link: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 ml-2" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>

      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-semibold mb-2">معلومات الجلسة</h3>
        <p className="text-sm text-muted-foreground">
          جلسة تسجيل الدخول صالحة لمدة 30 يوماً. بعد انتهاء المدة، ستحتاج لإعادة التحقق عبر OTP.
        </p>
      </div>
    </div>
  );
};

export default SettingsManager;

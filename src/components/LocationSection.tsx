import { useEffect, useState } from "react";
import { MapPin, ExternalLink, Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LocationSection = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("settings")
        .select("key,value")
        .in("key", ["google_maps_embed_url", "google_maps_direct_link", "center_address", "center_phone", "center_whatsapp"]);
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      setSettings(map);
    })();
  }, []);

  const embed = settings.google_maps_embed_url;
  const direct = settings.google_maps_direct_link;
  const address = settings.center_address;
  const phone = settings.center_phone;
  const whatsapp = settings.center_whatsapp;

  return (
    <section id="location" className="section-padding bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3">
            <MapPin className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">موقعنا</h2>
          <p className="text-muted-foreground">قم بزيارتنا في مقر المركز</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl overflow-hidden border border-border shadow-sm bg-card min-h-[320px]">
            {embed ? (
              <iframe
                src={embed}
                width="100%"
                height="100%"
                style={{ minHeight: 360, border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقع المركز على الخريطة"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
                لم يتم إعداد رابط الخريطة بعد.
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            {address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium mb-1">العنوان</div>
                  <div className="text-muted-foreground text-sm">{address}</div>
                </div>
              </div>
            )}
            {phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium mb-1">الهاتف</div>
                  <a href={`tel:${phone}`} className="text-muted-foreground text-sm hover:text-primary" dir="ltr">{phone}</a>
                </div>
              </div>
            )}
            {whatsapp && (
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium mb-1">واتساب</div>
                  <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="text-muted-foreground text-sm hover:text-primary" dir="ltr">{whatsapp}</a>
                </div>
              </div>
            )}
            {direct && (
              <a
                href={direct}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-2"
              >
                <ExternalLink className="w-4 h-4" />
                افتح في خرائط Google
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
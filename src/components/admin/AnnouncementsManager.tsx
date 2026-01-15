import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    published: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في جلب الإعلانات",
        variant: "destructive",
      });
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setFormData({ title: "", content: "", image_url: "", published: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      image_url: announcement.image_url || "",
      published: announcement.published,
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("announcements")
        .update({
          title: formData.title,
          content: formData.content,
          image_url: formData.image_url || null,
          published: formData.published,
        })
        .eq("id", editingId);

      if (error) {
        toast({ title: "خطأ", description: "فشل في تحديث الإعلان", variant: "destructive" });
      } else {
        toast({ title: "تم", description: "تم تحديث الإعلان بنجاح" });
        resetForm();
        fetchAnnouncements();
      }
    } else {
      const { error } = await supabase
        .from("announcements")
        .insert({
          title: formData.title,
          content: formData.content,
          image_url: formData.image_url || null,
          published: formData.published,
        });

      if (error) {
        toast({ title: "خطأ", description: "فشل في إنشاء الإعلان", variant: "destructive" });
      } else {
        toast({ title: "تم", description: "تم إنشاء الإعلان بنجاح" });
        resetForm();
        fetchAnnouncements();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;

    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في حذف الإعلان", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف الإعلان بنجاح" });
      fetchAnnouncements();
    }
  };

  const togglePublished = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("announcements")
      .update({ published: !currentValue })
      .eq("id", id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث حالة النشر", variant: "destructive" });
    } else {
      fetchAnnouncements();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">إدارة إعلانات الموقع</p>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة إعلان
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? "تعديل الإعلان" : "إعلان جديد"}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">العنوان *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان الإعلان"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">المحتوى *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="محتوى الإعلان"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">رابط الصورة (اختياري)</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <label className="text-sm font-medium">نشر الإعلان</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 ml-2" />}
              حفظ
            </Button>
            <Button variant="outline" onClick={resetForm}>
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد إعلانات بعد
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-card rounded-xl border border-border p-6 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  {announcement.published ? (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                      منشور
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                      مسودة
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">{announcement.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(announcement.created_at).toLocaleDateString("ar")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublished(announcement.id, announcement.published)}
                  title={announcement.published ? "إلغاء النشر" : "نشر"}
                >
                  {announcement.published ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(announcement.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManager;

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "./ConfirmDialog";

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
  const { t } = useTranslation();
  const [confirmId, setConfirmId] = useState<string | null>(null);
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
      toast({ title: t("admin.common.error"), description: t("admin.ann.fetchFail"), variant: "destructive" });
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
      toast({ title: t("admin.common.error"), description: t("admin.ann.reqFields"), variant: "destructive" });
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
        toast({ title: t("admin.common.error"), description: error.message, variant: "destructive" });
      } else {
        toast({ title: t("admin.common.done"), description: t("admin.ann.updatedOk") });
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
        toast({ title: t("admin.common.error"), description: error.message, variant: "destructive" });
      } else {
        toast({ title: t("admin.common.done"), description: t("admin.ann.createdOk") });
        resetForm();
        fetchAnnouncements();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      toast({ title: t("admin.common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.common.done"), description: t("admin.ann.deletedOk") });
      fetchAnnouncements();
    }
  };

  const togglePublished = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("announcements")
      .update({ published: !currentValue })
      .eq("id", id);

    if (error) {
      toast({ title: t("admin.common.error"), description: error.message, variant: "destructive" });
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
        <p className="text-muted-foreground">{t("admin.ann.subtitle")}</p>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-5 h-5 mx-2" />
          {t("admin.ann.add")}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? t("admin.ann.editTitle") : t("admin.ann.newTitle")}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("admin.ann.heading")} *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t("admin.ann.heading")}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t("admin.ann.content")} *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={t("admin.ann.content")}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t("admin.ann.image")}</label>
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
              <label className="text-sm font-medium">{t("admin.ann.publish")}</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mx-2" />}
              {t("admin.ann.save")}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              {t("admin.ann.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("admin.ann.empty")}
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
                      {t("admin.ann.published")}
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                      {t("admin.ann.draft")}
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
                  title={announcement.published ? t("admin.ann.unpublish") : t("admin.ann.publishAction")}
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
                  onClick={() => setConfirmId(announcement.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => { if (!o) setConfirmId(null); }}
        description={t("admin.ann.confirmDelete")}
        onConfirm={() => { if (confirmId) { handleDelete(confirmId); setConfirmId(null); } }}
      />
    </div>
  );
};

export default AnnouncementsManager;

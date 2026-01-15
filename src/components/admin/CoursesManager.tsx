import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  features: string[];
  published: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

const languageOptions = [
  { value: "english", label: "الإنجليزية", flag: "🇺🇸" },
  { value: "french", label: "الفرنسية", flag: "🇫🇷" },
  { value: "arabic", label: "العربية", flag: "🇸🇦" },
  { value: "spanish", label: "الإسبانية", flag: "🇪🇸" },
  { value: "german", label: "الألمانية", flag: "🇩🇪" },
];

const CoursesManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image_url: "",
    features: "",
    language: "english",
    published: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في جلب الدورات",
        variant: "destructive",
      });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const resetForm = () => {
    setFormData({ title: "", description: "", price: "", image_url: "", features: "", language: "english", published: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price.toString(),
      image_url: course.image_url || "",
      features: (course.features || []).join("\n"),
      language: course.language || "english",
      published: course.published,
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const featuresArray = formData.features
      .split("\n")
      .map(f => f.trim())
      .filter(f => f);

    if (editingId) {
      const { error } = await supabase
        .from("courses")
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url || null,
          features: featuresArray,
          language: formData.language,
          published: formData.published,
        } as any)
        .eq("id", editingId);

      if (error) {
        toast({ title: "خطأ", description: "فشل في تحديث الدورة", variant: "destructive" });
      } else {
        toast({ title: "تم", description: "تم تحديث الدورة بنجاح" });
        resetForm();
        fetchCourses();
      }
    } else {
      const { error } = await supabase
        .from("courses")
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url || null,
          features: featuresArray,
          language: formData.language,
          published: formData.published,
        } as any);

      if (error) {
        toast({ title: "خطأ", description: "فشل في إنشاء الدورة", variant: "destructive" });
      } else {
        toast({ title: "تم", description: "تم إنشاء الدورة بنجاح" });
        resetForm();
        fetchCourses();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في حذف الدورة", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف الدورة بنجاح" });
      fetchCourses();
    }
  };

  const togglePublished = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("courses")
      .update({ published: !currentValue })
      .eq("id", id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث حالة النشر", variant: "destructive" });
    } else {
      fetchCourses();
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
        <p className="text-muted-foreground">إدارة دورات المركز</p>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة دورة
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? "تعديل الدورة" : "دورة جديدة"}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">اسم الدورة *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="اسم الدورة"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">السعر (أوقية) *</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="السعر"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">الوصف *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف الدورة"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">المميزات (كل سطر ميزة)</label>
            <Textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">لغة الدورة *</label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, language: lang.value })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    formData.language === lang.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
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
            <label className="text-sm font-medium">نشر الدورة</label>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            لا توجد دورات بعد
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {languageOptions.find(l => l.value === course.language)?.flag || "🌐"}
                    </span>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    {course.published ? (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                        منشور
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                        مسودة
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary">{course.price} أوقية</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublished(course.id, course.published)}
                  >
                    {course.published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                    <Pencil className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(course.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{course.description}</p>

              {course.features && course.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.features.slice(0, 3).map((feature, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                  {course.features.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{course.features.length - 3} أخرى
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoursesManager;

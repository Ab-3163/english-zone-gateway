import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Loader2, Image, Video, Copy, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  published: boolean;
  title: string | null;
}

const MediaManager = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    
    // Use service role or direct query to get all media
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching media:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الملفات: " + error.message,
        variant: "destructive",
      });
    } else {
      setMedia(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `media/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "خطأ",
          description: `فشل في رفع ${file.name}: ${uploadError.message}`,
          variant: "destructive",
        });
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      // Save to media table with published = false by default
      const { error: insertError } = await supabase
        .from("media")
        .insert({
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type.startsWith("video") ? "video" : "image",
          file_size: file.size,
          published: false,
          title: file.name.split(".")[0],
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        toast({
          title: "خطأ",
          description: `فشل في حفظ ${file.name}: ${insertError.message}`,
          variant: "destructive",
        });
      }
    }

    toast({
      title: "تم",
      description: "تم رفع الملفات بنجاح",
    });

    setUploading(false);
    fetchMedia();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (item: MediaFile) => {
    if (!confirm("هل أنت متأكد من حذف هذا الملف؟")) return;

    // Extract path from URL
    const urlParts = item.file_url.split("/uploads/");
    if (urlParts.length > 1) {
      const path = urlParts[1];
      await supabase.storage.from("uploads").remove([path]);
    }

    const { error } = await supabase.from("media").delete().eq("id", item.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في حذف الملف", variant: "destructive" });
    } else {
      toast({ title: "تم", description: "تم حذف الملف بنجاح" });
      fetchMedia();
    }
  };

  const togglePublished = async (item: MediaFile) => {
    const { error } = await supabase
      .from("media")
      .update({ published: !item.published })
      .eq("id", item.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل في تحديث حالة النشر", variant: "destructive" });
    } else {
      toast({ 
        title: "تم", 
        description: item.published ? "تم إلغاء النشر" : "تم النشر - الملف ظاهر الآن في الموقع" 
      });
      fetchMedia();
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "تم", description: "تم نسخ الرابط" });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "غير معروف";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredMedia = media.filter((item) => {
    if (filter === "all") return true;
    if (filter === "published") return item.published;
    if (filter === "unpublished") return !item.published;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {uploading ? (
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            )}
            <span className="text-lg font-medium mb-2">
              {uploading ? "جاري الرفع..." : "اضغط لرفع ملفات"}
            </span>
            <span className="text-sm text-muted-foreground">
              صور أو فيديوهات
            </span>
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-card rounded-xl border border-border p-2">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          الكل ({media.length})
        </Button>
        <Button
          variant={filter === "published" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("published")}
        >
          منشور ({media.filter(m => m.published).length})
        </Button>
        <Button
          variant={filter === "unpublished" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("unpublished")}
        >
          غير منشور ({media.filter(m => !m.published).length})
        </Button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            لا توجد ملفات
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-xl border overflow-hidden group relative ${
                item.published ? "border-green-500/50" : "border-border"
              }`}
            >
              {/* Published Badge */}
              <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-medium ${
                item.published 
                  ? "bg-green-500 text-white" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {item.published ? "منشور" : "مخفي"}
              </div>

              {/* Preview */}
              <div className="relative aspect-square bg-muted">
                {item.file_type === "video" ? (
                  <video
                    src={item.file_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant={item.published ? "destructive" : "default"}
                    size="icon"
                    onClick={() => togglePublished(item)}
                    title={item.published ? "إلغاء النشر" : "نشر"}
                  >
                    {item.published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => copyUrl(item.file_url, item.id)}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 right-2">
                  {item.file_type === "video" ? (
                    <Video className="w-5 h-5 text-white drop-shadow" />
                  ) : (
                    <Image className="w-5 h-5 text-white drop-shadow" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium truncate">{item.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(item.file_size)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediaManager;

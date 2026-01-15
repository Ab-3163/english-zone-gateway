import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, content, image_url")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setAnnouncements(data);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  if (!isVisible || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex];

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4 animate-fade-in-down">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl shadow-lg p-4 relative">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{current.title}</h3>
              <p className="text-sm text-primary-foreground/90 line-clamp-1">{current.content}</p>
            </div>

            {announcements.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-xs px-2">{currentIndex + 1}/{announcements.length}</span>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;

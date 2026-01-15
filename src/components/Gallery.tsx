import { useState, useRef, useEffect } from "react";
import { X, Play, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import gallery1 from "@/assets/gallery-1.jpeg";
import gallery2 from "@/assets/gallery-2.jpeg";
import gallery3 from "@/assets/gallery-3.jpeg";
import graduationVideo from "@/assets/graduation-video.mp4";
import galleryVideo1 from "@/assets/gallery-video-1.mov";
import galleryVideo2 from "@/assets/gallery-video-2.mov";
import galleryVideo3 from "@/assets/gallery-video-3.mov";
import AnimatedSection from "./AnimatedSection";

interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  title: string | null;
}

// Default gallery items (fallback)
const defaultImages = [
  { src: gallery1, alt: "حفل تخرج طلاب ÉLITE ZONE", caption: "حفل التخرج" },
  { src: gallery2, alt: "نشاط تعليمي مع الأطفال", caption: "أنشطة تعليمية" },
  { src: gallery3, alt: "خريجون من المركز", caption: "خريجونا" }
];

const defaultVideos = [
  { src: galleryVideo1, caption: "فيديو من ÉLITE ZONE" },
  { src: galleryVideo2, caption: "لحظات مميزة" },
  { src: galleryVideo3, caption: "أنشطتنا التعليمية" }
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [dbImages, setDbImages] = useState<MediaItem[]>([]);
  const [dbVideos, setDbVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from("media")
        .select("id, file_name, file_url, file_type, title")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDbImages(data.filter(item => item.file_type === "image"));
        setDbVideos(data.filter(item => item.file_type === "video"));
      }
      setLoading(false);
    };

    fetchMedia();
  }, []);

  // Combine database images with default images
  const allImages = [
    ...dbImages.map(img => ({
      src: img.file_url,
      alt: img.title || img.file_name,
      caption: img.title || img.file_name.split(".")[0]
    })),
    ...defaultImages
  ];

  // Combine database videos with default videos
  const allVideos = [
    ...dbVideos.map(vid => ({
      src: vid.file_url,
      caption: vid.title || vid.file_name.split(".")[0]
    })),
    ...defaultVideos
  ];

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return;
    if (direction === "prev") {
      setSelectedImage(selectedImage === 0 ? allImages.length - 1 : selectedImage - 1);
    } else {
      setSelectedImage(selectedImage === allImages.length - 1 ? 0 : selectedImage + 1);
    }
  };

  return (
    <section id="gallery" className="section-padding bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-6 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full text-sm font-bold mb-4 border border-primary/20">
            معرض الصور والفيديو
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            لحظات من <span className="text-gradient">ÉLITE ZONE</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            صور من فعالياتنا وحفلات التخرج والأنشطة التعليمية
          </p>
        </AnimatedSection>

        {/* Featured Video */}
        <AnimatedSection delay={200} className="mb-12">
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl group cursor-pointer card-hover">
            <video
              ref={videoRef}
              src={graduationVideo}
              className="w-full aspect-video object-cover"
              poster={gallery1}
              onClick={() => {
                if (videoRef.current) {
                  if (isVideoPlaying) {
                    videoRef.current.pause();
                  } else {
                    videoRef.current.play();
                  }
                  setIsVideoPlaying(!isVideoPlaying);
                }
              }}
              onEnded={() => setIsVideoPlaying(false)}
              controls={isVideoPlaying}
            />
            {!isVideoPlaying && (
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.play();
                    setIsVideoPlaying(true);
                  }
                }}
              >
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  <Play className="w-8 h-8 text-white mr-[-4px]" fill="white" />
                </div>
                <div className="absolute bottom-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">خريجونا المتميزون</h3>
                  <p className="text-white/80">شاهد فيديو حفل التخرج</p>
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allImages.map((image, index) => (
            <AnimatedSection
              key={index}
              delay={300 + index * 100}
              animation="scale-in"
            >
              <div
                className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square card-3d shadow-lg"
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-bold mb-2">{image.caption}</h3>
                  <p className="text-white/80 text-sm">اضغط للتكبير</p>
                </div>
                {/* Overlay icon */}
                <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Additional Videos Grid */}
        <AnimatedSection delay={600} className="mt-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            فيديوهات <span className="text-gradient">ÉLITE ZONE</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allVideos.map((video, index) => (
              <AnimatedSection
                key={index}
                delay={700 + index * 100}
                animation="scale-in"
              >
                <div className="group relative overflow-hidden rounded-2xl shadow-lg card-hover">
                  <video
                    src={video.src}
                    className="w-full aspect-video object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                    <h3 className="text-white font-bold">{video.caption}</h3>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-primary transition-colors z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Navigation buttons */}
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-colors z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("next");
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-colors z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("prev");
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <img
              src={allImages[selectedImage].src}
              alt={allImages[selectedImage].alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Caption */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <h3 className="text-white text-xl font-bold">{allImages[selectedImage].caption}</h3>
              <p className="text-white/60 mt-2">{selectedImage + 1} / {allImages.length}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;

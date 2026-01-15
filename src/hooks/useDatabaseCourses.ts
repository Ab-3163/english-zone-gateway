import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  features: string[];
}

interface UseDatabaseCoursesResult {
  courses: Course[];
  loading: boolean;
  defaultPrice: number | null;
}

export const useDatabaseCourses = (): UseDatabaseCoursesResult => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultPrice, setDefaultPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (coursesData) {
        setCourses(coursesData);
      }

      // Fetch default price
      const { data: priceData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "default_course_price")
        .maybeSingle();

      if (priceData) {
        setDefaultPrice(parseFloat(priceData.value));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return { courses, loading, defaultPrice };
};

export default useDatabaseCourses;

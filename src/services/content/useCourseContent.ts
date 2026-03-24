import { useQuery } from "@tanstack/react-query";
import { fetchCourseContent } from "@/services/content/service";

export const useCourseContent = () =>
  useQuery({
    queryKey: ["course-content"],
    queryFn: fetchCourseContent,
    staleTime: 60_000,
  });

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { CourseContent } from "@/services/content/service";
import { fetchCourseContent } from "@/services/content/service";

export const COURSE_CONTENT_QUERY_KEY = ["course-content"] as const;

type CourseContentQueryOptions = Omit<
  UseQueryOptions<CourseContent, Error, CourseContent, typeof COURSE_CONTENT_QUERY_KEY>,
  "queryKey" | "queryFn"
>;

export const useCourseContent = (options?: CourseContentQueryOptions) =>
  useQuery({
    queryKey: COURSE_CONTENT_QUERY_KEY,
    queryFn: fetchCourseContent,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });

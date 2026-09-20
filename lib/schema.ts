import { z } from "zod";

export const LessonSchema = z.object({
  category: z.string(),
  question: z.string(),
  news_connection: z.string(),
  core_concept: z.string(),
  essentials: z.string(),
  challenge: z.string(),
  connection_title: z.string(),
  connection_body: z.string(),
  quiz_question: z.string(),
  quiz_a: z.string(),
  quiz_b: z.string(),
  quiz_c: z.string(),
  quiz_answer: z.enum(["A", "B", "C"]),
  quiz_explanation: z.string(),
  viewpoint: z.string(),
  source_title: z.string(),
  source_url: z.string().url(),
  source_published_at: z.string().nullable(),
});

export const DailyPackageSchema = z.object({
  lessons: z.array(LessonSchema).length(3),
});

export type Lesson = z.infer<typeof LessonSchema>;

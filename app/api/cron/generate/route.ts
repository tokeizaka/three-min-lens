import { NextRequest, NextResponse } from "next/server";
import { collectNewsCandidates } from "@/lib/news";
import { generateDailyLessons } from "@/lib/generate";
import { getAdminSupabase } from "@/lib/supabase";

export const maxDuration = 60;

function todayJst() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publishDate = todayJst();
  const supabase = getAdminSupabase();

  const { data: existing, error: existingError } = await supabase
    .from("daily_lessons")
    .select("id,slot")
    .eq("publish_date", publishDate);

  if (existingError) throw existingError;
  const force = req.nextUrl.searchParams.get("force") === "1";
  if (!force && (existing?.length ?? 0) >= 3) {
    return NextResponse.json({ ok: true, skipped: true, reason: "already_generated", publishDate });
  }

  const candidates = await collectNewsCandidates();
  if (candidates.length < 3) {
    return NextResponse.json({ error: "Not enough news candidates", count: candidates.length }, { status: 500 });
  }

  const generated = await generateDailyLessons(candidates);

  const rows = generated.package.lessons.map((lesson, index) => ({
    publish_date: publishDate,
    slot: index + 1,
    category: lesson.category,
    question: lesson.question,
    news_connection: lesson.news_connection,
    core_concept: lesson.core_concept,
    essentials: lesson.essentials,
    challenge: lesson.challenge,
    connection_title: lesson.connection_title,
    connection_body: lesson.connection_body,
    quiz_question: lesson.quiz_question,
    quiz_a: lesson.quiz_a,
    quiz_b: lesson.quiz_b,
    quiz_c: lesson.quiz_c,
    quiz_answer: lesson.quiz_answer,
    quiz_explanation: lesson.quiz_explanation,
    viewpoint: lesson.viewpoint,
    source_title: lesson.source_title,
    source_url: lesson.source_url,
    source_published_at: lesson.source_published_at,
    status: "published",
    ai_model: generated.model,
    ai_run_id: generated.responseId,
  }));

  const { error } = await supabase
    .from("daily_lessons")
    .upsert(rows, { onConflict: "publish_date,slot" });

  if (error) throw error;

  return NextResponse.json({ ok: true, publishDate, generated: rows.length });
}

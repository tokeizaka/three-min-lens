import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getPublicSupabase();
  const { data: lesson, error } = await supabase
    .from("daily_lessons")
    .select("*")
    .eq("id", slug)
    .eq("status", "published")
    .single();

  if (error || !lesson) notFound();

  return (
    <main>
      <Link href="/" className="meta">← 今日の3問へ</Link>
      <article className="lesson">
        <div className="meta"><span className="badge">{lesson.category}</span><span>約3分</span></div>
        <h1>{lesson.question}</h1>
        <p>{lesson.news_connection}</p>

        <h2>まず、これだけ。</h2>
        <p className="core">{lesson.core_concept}</p>
        <p>{lesson.essentials}</p>

        <h2>でも、ちょっと待って。</h2>
        <p>{lesson.challenge}</p>

        <h2>{lesson.connection_title}</h2>
        <p>{lesson.connection_body}</p>

        <section className="quiz">
          <h2>ちょっと考えてみる</h2>
          <p><strong>{lesson.quiz_question}</strong></p>
          <div className="option">A. {lesson.quiz_a}</div>
          <div className="option">B. {lesson.quiz_b}</div>
          <div className="option">C. {lesson.quiz_c}</div>
          <details>
            <summary><strong>答えを見る</strong></summary>
            <p><strong>答え：{lesson.quiz_answer}</strong></p>
            <p>{lesson.quiz_explanation}</p>
          </details>
        </section>

        <h2>今日から見るポイント</h2>
        <div className="viewpoint">{lesson.viewpoint}</div>

        <div className="source">
          きっかけになったニュース：<a href={lesson.source_url} target="_blank" rel="noreferrer">{lesson.source_title}</a>
        </div>
        <div className="footer">今日はここまでで十分です。</div>
      </article>
    </main>
  );
}

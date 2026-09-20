import Link from "next/link";
import { getPublicSupabase } from "@/lib/supabase";

function todayJst() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getPublicSupabase();
  const date = todayJst();
  const { data: lessons, error } = await supabase
    .from("daily_lessons")
    .select("id,slot,category,question,news_connection")
    .eq("publish_date", date)
    .eq("status", "published")
    .order("slot", { ascending: true });

  if (error) throw error;

  return (
    <main>
      <section className="hero">
        <h1>今日、3分だけ。<br />世界を見る視点を1つ増やす。</h1>
        <p>今日のニュースから、知っておくと世界の見え方が少し変わる「問い」を3つ。</p>
      </section>

      <section className="grid">
        {(lessons ?? []).map((lesson) => (
          <Link className="card" href={`/learn/${lesson.id}`} key={lesson.id}>
            <div className="meta"><span className="badge">{lesson.category}</span><span>約3分</span></div>
            <h2>{lesson.question}</h2>
            <p>{lesson.news_connection}</p>
          </Link>
        ))}

        {(!lessons || lessons.length === 0) && (
          <div className="card">
            <h2>今日の3問を準備中です。</h2>
            <p>自動生成がまだ実行されていない場合は、Cron APIを手動実行してください。</p>
          </div>
        )}
      </section>
    </main>
  );
}

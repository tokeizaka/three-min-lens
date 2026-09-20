import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { DailyPackageSchema } from "./schema";
import { MASTER_PROMPT } from "./prompt";
import type { NewsCandidate } from "./news";

export async function generateDailyLessons(candidates: NewsCandidate[]) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-6-astra";

  const response = await client.responses.parse({
    model,
    input: [
      { role: "system", content: MASTER_PROMPT },
      {
        role: "user",
        content:
          "以下のニュース候補から、今日の3分教養を3本作成してください。候補にないニュースを追加しないでください。\n\n" +
          JSON.stringify(candidates, null, 2),
      },
    ],
    text: {
      format: zodTextFormat(DailyPackageSchema, "daily_lessons"),
    },
  });

  if (!response.output_parsed) throw new Error("No parsed output from OpenAI");

  const allowedUrls = new Set(candidates.map((c) => c.url));
  for (const lesson of response.output_parsed.lessons) {
    if (!allowedUrls.has(lesson.source_url)) {
      throw new Error(`Model returned unknown source URL: ${lesson.source_url}`);
    }
  }

  return { package: response.output_parsed, model, responseId: response.id };
}

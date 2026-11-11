import type { InsightFacts } from "./engine";

/**
 * Optional: rewrite the headline + summary with Google Gemini (free tier available).
 * Only the wording is AI-generated; every number is passed in from the indicator engine.
 */
export const geminiModel = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const aiEnabled = () => !!process.env.GEMINI_API_KEY;

export async function geminiNarrative(facts: InsightFacts): Promise<{ headline: string; summary: string }> {
  const prompt = `You are a concise equity analyst writing for retail investors.
Using ONLY the technical facts below (do not invent news, fundamentals, or numbers that are not given),
write a short headline (max 12 words) and a 3-5 sentence summary of the setup.
Mention the most important signals, key levels, and the overall lean. Plain English, no hype, no advice to buy or sell.

Facts (JSON):
${JSON.stringify(facts, (_k, v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v))}

Respond with JSON: {"headline": string, "summary": string}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");
  const parsed = JSON.parse(text);
  if (typeof parsed.headline !== "string" || typeof parsed.summary !== "string") throw new Error("Bad Gemini JSON");
  return { headline: parsed.headline.trim(), summary: parsed.summary.trim() };
}

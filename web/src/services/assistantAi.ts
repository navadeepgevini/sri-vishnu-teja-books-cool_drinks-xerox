// Step 2 of the shop helper: asks the "shop-assistant" Supabase Edge Function, which holds the Groq key
// and answers only from the shop's facts plus the product lines we send (see
// supabase/functions/shop-assistant/index.ts). Plain fetch, so the Supabase library is not loaded.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export type AiResult = { ok: true; answer: string } | { ok: false; reason: 'busy' | 'unavailable' }

export async function askShopAi(question: string, products: string[]): Promise<AiResult> {
  if (!url || !key) return { ok: false, reason: 'unavailable' }
  try {
    const res = await fetch(`${url}/functions/v1/shop-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key },
      body: JSON.stringify({ question: question.slice(0, 200), products: products.slice(0, 60) }),
      signal: AbortSignal.timeout(20_000),
    })
    if (res.status === 429) return { ok: false, reason: 'busy' }
    if (!res.ok) return { ok: false, reason: 'unavailable' }
    const data: unknown = await res.json()
    const answer = typeof data === 'object' && data && 'answer' in data ? String(data.answer).trim() : ''
    return answer ? { ok: true, answer } : { ok: false, reason: 'unavailable' }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}

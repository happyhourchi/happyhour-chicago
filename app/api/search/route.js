export const runtime = 'edge';

export async function POST(req) {
  try {
    const { query } = await req.json();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Find happy hour deals at Chicago restaurants. Return ONLY a valid JSON array with no markdown, no backticks, no explanation. Just the raw JSON array. Up to 4 objects each with: name, address, cuisine (American/Mexican/Italian/Asian/Bar & Grill/Seafood/Other), time (e.g. 4-7 PM), days (array like ["Mon","Tue","Wed","Thu","Fri"]), deals (array of short strings).',
        messages: [{ role: 'user', content: query }],
      }),
    });
    const data = await res.json();
    const text = data?.content?.[0]?.text || '[]';
    const clean = text.replace(/```json/g,'').replace(/```/g,'').trim();
    const results = JSON.parse(clean);
    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ results: [], error: e.message }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

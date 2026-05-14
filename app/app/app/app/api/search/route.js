export async function POST(req) {
  const { query } = await req.json();
  try {
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
        system: 'Find happy hour deals at Chicago restaurants. Return ONLY a valid JSON array with no markdown of up to 4 objects with fields: name, address, cuisine (American/Mexican/Italian/Asian/Bar & Grill/Seafood/Other), time (e.g. 4-7 PM), days (array like ["Mon","Tue","Wed","Thu","Fri"]), deals (array of short strings).',
        messages: [{ role: 'user', content: query }],
      }),
    });
    const data = await res.json();
    const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '[]';
    const results = JSON.parse(text.replace(/```json|```/g, '').trim());
    return Response.json({ results });
  } catch (e) {
    return Response.json({ results: [] });
  }
}

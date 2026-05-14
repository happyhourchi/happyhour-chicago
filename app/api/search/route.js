export async function POST(request) {
  try {
    const body = await request.json();
    const query = body.query || 'happy hour deals Chicago';
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Find 4 real Chicago restaurant happy hour deals for: ${query}. Reply with ONLY a JSON array, no other text. Each item must have: name, address, cuisine, time, days (array), deals (array).`
        }],
      }),
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text || '[]';
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;
    const jsonStr = text.slice(start, end);
    const results = JSON.parse(jsonStr);
    
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ results: [], error: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

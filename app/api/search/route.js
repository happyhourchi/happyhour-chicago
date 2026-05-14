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
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Find 4 Chicago restaurant happy hour deals for: ${query}. Reply with ONLY a JSON array. No other text. Example format: [{"name":"Bar Name","address":"123 Main St, Chicago","cuisine":"American","time":"4-7 PM","days":["Mon","Tue","Wed","Thu","Fri"],"deals":["$5 beer","$7 cocktails"]}]`
        }],
      }),
    });

    const raw = await response.json();
    
    if (raw.error) {
      return new Response(JSON.stringify({ results: [], error: raw.error.message }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = raw?.content?.[0]?.text || '[]';
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;
    
    if (start === -1) {
      return new Response(JSON.stringify({ results: [], debug: text }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const results = JSON.parse(text.slice(start, end));
    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ results: [], error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

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
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        tools: [{type: 'web_search_20250305', name: 'web_search'}],
        system: 'You are a Chicago happy hour expert. Search the web to find REAL current happy hour deals at Chicago restaurants. Return ONLY a valid JSON array with no markdown. Each object must have: name, address, cuisine (American/Mexican/Italian/Asian/Bar & Grill/Seafood/Other), time (e.g. 4-7 PM), days (array like ["Mon","Tue","Wed","Thu","Fri"]), deals (array of specific deal strings like "$5 margaritas"). Only include deals you actually found on their website or a reliable source.',
        messages: [{role: 'user', content: `Search for real happy hour deals: ${query}. Visit restaurant websites to find actual current deals. Return as JSON array only.`}],
      }),
    });

    const data = await response.json();
    const textBlock = data?.content?.filter(b=>b.type==='text').map(b=>b.text).join('');
    
    if(!textBlock) return new Response(JSON.stringify({results:[],error:'No response'}),{headers:{'Content-Type':'application/json'}});
    
    const start = textBlock.indexOf('[');
    const end = textBlock.lastIndexOf(']')+1;
    if(start===-1) return new Response(JSON.stringify({results:[],debug:textBlock.slice(0,200)}),{headers:{'Content-Type':'application/json'}});
    
    const results = JSON.parse(textBlock.slice(start,end));
    return new Response(JSON.stringify({results}),{headers:{'Content-Type':'application/json'}});
  } catch(err) {
    return new Response(JSON.stringify({results:[],error:err.message}),{headers:{'Content-Type':'application/json'}});
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  const cookieHeader = request.headers.get('Cookie') || '';
  const isLoggedIn = cookieHeader.split(';').some((part) => {
    const [name, value] = part.trim().split('=');
    return name === 'admin_session' && value === '1';
  });

  if (!isLoggedIn) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const kv = env.LOUAI_CONFIG;
  if (!kv) {
    return new Response(JSON.stringify({ error: 'KV namespace LOUAI_CONFIG missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  if (request.method === 'GET') {
    try {
      const raw = await kv.get('tools');
      const tools = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ tools }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to load tools' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
  }

  if (request.method === 'POST') {
    let body = null;
    try {
      body = await request.json();
    } catch (_err) {
      body = null;
    }

    if (!body || !body.title) {
      return new Response(JSON.stringify({ error: 'title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const tags =
      Array.isArray(body.tags) && body.tags.length
        ? body.tags.map((t) => String(t))
        : typeof body.tags === 'string'
          ? body.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [];
    const iconUrl = body.iconUrl ? String(body.iconUrl).trim() : '';
    const previewUrl = body.previewUrl ? String(body.previewUrl).trim() : '';

    let tools = [];
    try {
      const raw = await kv.get('tools');
      if (raw) tools = JSON.parse(raw);
    } catch (_err) {
      tools = [];
    }

    const id = `${Date.now()}`;
    const tool = {
      id,
      title,
      description,
      tags,
      iconUrl,
      previewUrl,
    };

    tools.push(tool);
    await kv.put('tools', JSON.stringify(tools));

    return new Response(JSON.stringify({ success: true, tool, tools }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'GET, POST' },
  });
}




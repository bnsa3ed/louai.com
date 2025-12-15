export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'PUT') {
    return new Response('Method Not Allowed', { status: 405 });
  }

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

  let body;
  try {
    body = await request.json();
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const kv = env.LOUAI_CONFIG;
  if (!kv) {
    return new Response(JSON.stringify({ error: 'KV binding LOUAI_CONFIG missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const payload = {
    linkedin: body.linkedin || null,
    instagram: body.instagram || null,
    behance: body.behance || null,
  };

  await kv.put('settings:social', JSON.stringify(payload));

  return new Response(JSON.stringify({ success: true, social: payload }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}



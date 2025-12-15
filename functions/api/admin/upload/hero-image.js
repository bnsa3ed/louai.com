export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
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

  const bucket = env.LOUAIMEDIA;
  const kv = env.LOUAI_CONFIG;
  const publicBase = env.R2_PUBLIC_BASE_URL || '';

  if (!bucket || !kv) {
    return new Response(
      JSON.stringify({ error: 'R2 bucket LOUAIMEDIA or KV LOUAI_CONFIG missing' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return new Response(JSON.stringify({ error: 'File is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const filename = file.name || 'hero-image';
  const ext = filename.includes('.') ? filename.split('.').pop() : 'jpg';
  const key = `hero/hero-${Date.now()}.${ext}`;

  await bucket.put(key, file.stream());

  const url = publicBase ? `${publicBase}/${key}` : key;

  // Update hero settings in KV
  let hero = null;
  try {
    const raw = await kv.get('settings:hero');
    if (raw) hero = JSON.parse(raw);
  } catch (_err) {
    hero = null;
  }

  const updatedHero = {
    ...(hero || {}),
    imageUrl: url,
  };

  await kv.put('settings:hero', JSON.stringify(updatedHero));

  return new Response(JSON.stringify({ success: true, key, url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}



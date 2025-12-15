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
  const title = formData.get('title') || 'Reel';
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return new Response(JSON.stringify({ error: 'File is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const filename = file.name || 'reel';
  const ext = filename.includes('.') ? filename.split('.').pop() : 'mp4';
  const id = `${Date.now()}`;
  const key = `reels/${id}.${ext}`;

  await bucket.put(key, file.stream());

  const url = publicBase ? `${publicBase}/${key}` : key;

  // Append to reels array in KV
  let reels = [];
  try {
    const raw = await kv.get('reels');
    if (raw) reels = JSON.parse(raw);
  } catch (_err) {
    reels = [];
  }

  const newReel = {
    id,
    title,
    videoUrl: url,
  };

  reels.push(newReel);
  await kv.put('reels', JSON.stringify(reels));

  return new Response(JSON.stringify({ success: true, reel: newReel }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}



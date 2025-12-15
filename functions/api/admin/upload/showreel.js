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

  const filename = file.name || 'showreel';
  const ext = filename.includes('.') ? filename.split('.').pop() : 'mp4';
  const key = `showreel/showreel-${Date.now()}.${ext}`;

  await bucket.put(key, file.stream());

  const url = publicBase ? `${publicBase}/${key}` : key;

  // Best-effort cleanup of previous showreel
  try {
    const raw = await kv.get('settings:showreel');
    if (raw) {
      const prev = JSON.parse(raw);
      if (prev && prev.videoUrl) {
        let oldKey = null;
        const oldUrl = prev.videoUrl;
        if (publicBase && oldUrl.startsWith(publicBase + '/')) {
          oldKey = oldUrl.slice(publicBase.length + 1);
        } else {
          const marker = '/louaimedia/';
          const idx = oldUrl.indexOf(marker);
          if (idx !== -1) {
            oldKey = oldUrl.slice(idx + marker.length);
          }
        }
        if (oldKey) {
          await bucket.delete(oldKey);
        }
      }
    }
  } catch (_cleanupErr) {
    // ignore cleanup failures
  }

  const payload = {
    videoUrl: url,
  };

  await kv.put('settings:showreel', JSON.stringify(payload));

  return new Response(JSON.stringify({ success: true, key, url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}



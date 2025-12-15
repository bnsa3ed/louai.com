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
  const logoFile = formData.get('logoFile');
  const cvFile = formData.get('cvFile');

  let logoUrl = null;
  let cvUrl = null;

  if (logoFile && typeof logoFile !== 'string') {
    const logoName = logoFile.name || 'logo.png';
    const logoExt = logoName.includes('.') ? logoName.split('.').pop() : 'png';
    const logoKey = `branding/logo-${Date.now()}.${logoExt}`;
    await bucket.put(logoKey, logoFile.stream());
    logoUrl = publicBase ? `${publicBase}/${logoKey}` : logoKey;
  }

  if (cvFile && typeof cvFile !== 'string') {
    const cvName = cvFile.name || 'cv.pdf';
    const cvExt = cvName.includes('.') ? cvName.split('.').pop() : 'pdf';
    const cvKey = `cv/cv-${Date.now()}.${cvExt}`;
    await bucket.put(cvKey, cvFile.stream());
    cvUrl = publicBase ? `${publicBase}/${cvKey}` : cvKey;
  }

  let branding = null;
  try {
    const raw = await kv.get('settings:branding');
    if (raw) branding = JSON.parse(raw);
  } catch (_err) {
    branding = null;
  }

  const updatedBranding = {
    ...(branding || {}),
    ...(logoUrl ? { logoUrl } : {}),
    ...(cvUrl ? { cvUrl } : {}),
  };

  await kv.put('settings:branding', JSON.stringify(updatedBranding));

  return new Response(
    JSON.stringify({ success: true, branding: updatedBranding, logoUrl, cvUrl }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    },
  );
}



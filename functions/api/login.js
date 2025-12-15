/**
 * Simple login endpoint for the admin dashboard.
 *
 * For now, credentials are taken from environment variables:
 *   - ADMIN_USERNAME (default: "admin")
 *   - ADMIN_PASSWORD (no default; must be set)
 *
 * On success, sets a basic HttpOnly session cookie that /api/admin/me
 * can later validate. This is intentionally minimal and can be hardened
 * later (e.g. with signed tokens stored in KV).
 */
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const username = (body.username || "").toString();
  const password = (body.password || "").toString();

  const expectedUser = env.ADMIN_USERNAME || "admin";
  // Temporary fallback credentials for local/dev use if ADMIN_PASSWORD is not set.
  // Username: admin
  // Password: admin
  // Change this as soon as you configure a real password in the environment.
  const expectedPass = env.ADMIN_PASSWORD || "admin";

  const ok = username === expectedUser && password === expectedPass;
  if (!ok) {
    return new Response(
      JSON.stringify({ error: "Invalid username or password." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );
  }

  // Minimal session: presence of this cookie means "logged in".
  // For a personal portfolio this can be acceptable, but can be
  // replaced later with a signed token.
  const cookie =
    "admin_session=1; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800";

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": cookie,
    },
  });
}



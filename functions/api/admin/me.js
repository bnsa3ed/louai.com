/**
 * Returns basic info about the currently logged-in admin.
 * Used by the dashboard to decide whether to redirect to /login.
 */
export async function onRequest(context) {
  const { request, env } = context;

  const cookieHeader = request.headers.get("Cookie") || "";
  const isLoggedIn = cookieHeader.split(";").some((part) => {
    const [name, value] = part.trim().split("=");
    return name === "admin_session" && value === "1";
  });

  if (!isLoggedIn) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const username = env.ADMIN_USERNAME || "admin";

  return new Response(
    JSON.stringify({
      authenticated: true,
      username,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
  );
}



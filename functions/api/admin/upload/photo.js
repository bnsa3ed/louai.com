export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const isLoggedIn = cookieHeader.split(";").some((part) => {
    const [name, value] = part.trim().split("=");
    return name === "admin_session" && value === "1";
  });

  if (!isLoggedIn) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const bucket = env.LOUAIMEDIA;
  const kv = env.LOUAI_CONFIG;
  const publicBase = env.R2_PUBLIC_BASE_URL || "";

  if (!bucket || !kv) {
    return new Response(
      JSON.stringify({
        error: "R2 bucket LOUAIMEDIA or KV LOUAI_CONFIG missing",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );
  }

  const formData = await request.formData();
  const categoryId = formData.get("categoryId");

  if (!categoryId || typeof categoryId !== "string") {
    return new Response(JSON.stringify({ error: "categoryId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const files = formData.getAll("files");
  if (!files || files.length === 0) {
    return new Response(JSON.stringify({ error: "At least one file is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Load existing categories
  let categories = [];
  try {
    const raw = await kv.get("photography:categories");
    if (raw) categories = JSON.parse(raw);
  } catch (_err) {
    categories = [];
  }

  const idx = categories.findIndex((c) => c.id === categoryId);
  if (idx === -1) {
    return new Response(JSON.stringify({ error: "Category not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const uploaded = [];
  for (const f of files) {
    if (typeof f === "string") continue;
    const filename = f.name || "photo";
    const ext = filename.includes(".") ? filename.split(".").pop() : "jpg";
    const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const key = `photography/${categoryId}/${photoId}.${ext}`;
    await bucket.put(key, f.stream());
    const url = publicBase ? `${publicBase}/${key}` : key;
    uploaded.push({ id: photoId, imageUrl: url });
  }

  const existingImages = Array.isArray(categories[idx].images)
    ? categories[idx].images
    : [];
  categories[idx].images = [...existingImages, ...uploaded];

  await kv.put("photography:categories", JSON.stringify(categories));

  return new Response(
    JSON.stringify({ success: true, categoryId, images: uploaded }),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
  );
}



export async function onRequest(context) {
  const { env } = context;

  // Expect a KV namespace binding named LOUAI_CONFIG
  const kv = env.LOUAI_CONFIG;

  // Helper to read JSON from KV with fallback
  async function getJson(key, fallback) {
    if (!kv) return fallback;
    try {
      const raw = await kv.get(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_err) {
      return fallback;
    }
  }

  // Hard-coded defaults used when KV is empty (first deploy / local)
  const defaultHero = {
    titleLine1: "Hi, I'm Mohamed",
    titleLine2: "I create Video Content and AI Automation.",
    subtitle: null,
    imageUrl: "https://cdn.bnsaied.com/others/hero.jpg",
    techStack: [], // can be populated later from KV
    openToWorkEmail: "contact@bnsaied.com",
  };

  const defaultBranding = {
    logoUrl: "https://cdn.bnsaied.com/others/logo.png",
    cvUrl:
      "https://cdn.bnsaied.com/others/Mohamed%20Said%20CV%202025%20UPDATED%202.pdf",
  };

  const defaultContact = {
    primaryEmail: "contact@bnsaied.com",
    whatsappNumber: "971524627678",
  };

  const defaultSocial = {
    linkedin: "https://www.linkedin.com/in/bnsaied",
    instagram: "https://www.instagram.com/mosacontent",
    behance: "https://www.behance.net/bn_sa3ed",
  };

  const defaultSeo = {
    siteTitle: "Mohamed Said Mohamed | Video Editor & AI Specialist in Dubai",
    metaDescription:
      "Mohamed Said Mohamed - Professional Video Editor, Cinematographer, and AI Specialist based in Dubai. Creating viral video content, AI automation tools, and stunning photography for brands worldwide.",
    keywords:
      "video editor, cinematographer, AI specialist, Dubai, content creator, video production, photography, viral reels, AI automation",
    canonicalUrl: "https://bnsaied.com/",
    ogImageUrl: "https://cdn.bnsaied.com/others/hero.jpg",
  };

  const [
    hero,
    branding,
    showreel,
    reels,
    tools,
    photography,
    contact,
    social,
    seo,
  ] = await Promise.all([
    getJson("settings:hero", defaultHero),
    getJson("settings:branding", defaultBranding),
    getJson("settings:showreel", null),
    getJson("reels", []),
    getJson("tools", []),
    getJson("photography:categories", []),
    getJson("settings:contact", defaultContact),
    getJson("settings:social", defaultSocial),
    getJson("settings:seo", defaultSeo),
  ]);

  const body = {
    hero,
    branding,
    showreel,
    reels,
    tools,
    photography,
    contact,
    social,
    seo,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Adjust in production if you want stricter CORS
      "Access-Control-Allow-Origin": "*",
    },
  });
}



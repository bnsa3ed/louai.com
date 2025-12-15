// Simple helpers
function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

const toastEl = $("#toast");
const overlayEl = $("#overlay");

function showToast(message, type = "info") {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className = "admin-toast " + type + " show";
  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3000);
}

function showOverlay(show) {
  if (!overlayEl) return;
  overlayEl.classList.toggle("hidden", !show);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || "Request failed";
    throw new Error(msg);
  }
  return data;
}

async function ensureAuthenticated() {
  try {
    const me = await fetchJson("/api/admin/me");
    const userEl = $("#adminUser");
    if (userEl && me && me.username) {
      userEl.textContent = me.username;
      userEl.style.display = "inline-flex";
    }
  } catch (_err) {
    // Local fallback: if /api/admin/me is not available (static server),
    // but the local login has set admin_session=1, allow access.
    const hasLocalSession = document.cookie
      .split(";")
      .map((c) => c.trim())
      .some((c) => c === "admin_session=1");

    if (!hasLocalSession) {
      window.location.href = "/login.html";
    } else {
      // Local fallback: hide the empty user pill so it doesn't show
      const userEl = $("#adminUser");
      if (userEl) {
        userEl.style.display = "none";
      }
    }
  }
}

async function loadConfig() {
  showOverlay(true);
  try {
    const cfg = await fetchJson("/api/config");

    // Hero
    if (cfg.hero) {
      if (cfg.hero.titleLine1) $("#heroTitle1").value = cfg.hero.titleLine1;
      if (cfg.hero.titleLine2) $("#heroTitle2").value = cfg.hero.titleLine2;
      if (cfg.hero.subtitle) $("#heroSubtitle").value = cfg.hero.subtitle;
      if (Array.isArray(cfg.hero.techStack)) {
        renderTechList(cfg.hero.techStack);
      }
    }

    // Contact
    if (cfg.contact) {
      if (cfg.contact.primaryEmail) {
        $("#contactEmail").value = cfg.contact.primaryEmail;
      }
      if (cfg.contact.whatsappNumber) {
        $("#whatsappNumber").value = cfg.contact.whatsappNumber;
      }
    }

    // Social
    if (cfg.social) {
      if (cfg.social.linkedin) {
        $("#socialLinkedin").value = cfg.social.linkedin;
      }
      if (cfg.social.instagram) {
        $("#socialInstagram").value = cfg.social.instagram;
      }
      if (cfg.social.behance) {
        $("#socialBehance").value = cfg.social.behance;
      }
    }

    // SEO
    if (cfg.seo) {
      if (cfg.seo.siteTitle) $("#siteTitle").value = cfg.seo.siteTitle;
      if (cfg.seo.metaDescription) {
        $("#metaDescription").value = cfg.seo.metaDescription;
      }
      if (cfg.seo.keywords) {
        $("#metaKeywords").value = cfg.seo.keywords;
      }
      if (cfg.seo.canonicalUrl) {
        $("#canonicalUrl").value = cfg.seo.canonicalUrl;
      }
    }

    // Reels list placeholder
    if (Array.isArray(cfg.reels)) {
      renderReelsList(cfg.reels);
    }

    // Tools
    if (Array.isArray(cfg.tools)) {
      renderToolsList(cfg.tools);
    }

    // Photography
    if (Array.isArray(cfg.photography)) {
      renderPhotoCategories(cfg.photography);
      const select = $("#photoCategorySelect");
      if (select) {
        select.innerHTML = "";
        cfg.receivedPhotography = cfg.photography;
        cfg.photography.forEach((cat) => {
          const opt = document.createElement("option");
          opt.value = cat.id;
          opt.textContent = cat.name || cat.slug || "Category";
          select.appendChild(opt);
        });
      }
    }
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed to load config", "error");
  } finally {
    showOverlay(false);
  }
}

// Render helpers (currently read-only; edit endpoints will be added later)

function renderTechList(items) {
  const container = $("#techList");
  if (!container) return;
  container.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "admin-list-item";
    const label = document.createElement("span");
    label.textContent = item.label || item.id || "Tech";
    const chip = document.createElement("span");
    chip.className = "admin-chip";
    chip.textContent = "icon";
    const actions = document.createElement("div");
    actions.className = "admin-list-actions";
    // Delete / reorder buttons can be wired later
    const placeholderBtn = document.createElement("button");
    placeholderBtn.type = "button";
    placeholderBtn.className = "admin-button secondary";
    placeholderBtn.style.fontSize = "11px";
    placeholderBtn.textContent = "Edit (soon)";
    placeholderBtn.disabled = true;
    actions.appendChild(placeholderBtn);
    div.appendChild(label);
    div.appendChild(chip);
    div.appendChild(actions);
    container.appendChild(div);
  });
}

function renderReelsList(items) {
  const container = $("#reelsList");
  if (!container) return;
  container.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "admin-list-item";
    const label = document.createElement("span");
    label.textContent = item.title || item.id || "Reel";
    const chip = document.createElement("span");
    chip.className = "admin-chip";
    chip.textContent = "video";
    div.appendChild(label);
    div.appendChild(chip);
    container.appendChild(div);
  });
}

function renderToolsList(items) {
  const container = $("#toolsList");
  if (!container) return;
  container.innerHTML = "";
  items.forEach((tool) => {
    const div = document.createElement("div");
    div.className = "admin-list-item";
    const label = document.createElement("span");
    label.textContent = tool.title || tool.id || "Tool";
    const chip = document.createElement("span");
    chip.className = "admin-chip";
    chip.textContent = Array.isArray(tool.tags) ? tool.tags.join(", ") : "tool";
    div.appendChild(label);
    div.appendChild(chip);
    container.appendChild(div);
  });
}

function renderPhotoCategories(items) {
  const container = $("#photoCategoriesList");
  if (!container) return;
  container.innerHTML = "";
  items.forEach((cat) => {
    const div = document.createElement("div");
    div.className = "admin-list-item";
    const label = document.createElement("span");
    label.textContent = cat.name || cat.slug || "Category";
    const chip = document.createElement("span");
    chip.className = "admin-chip";
    const count = Array.isArray(cat.images) ? cat.images.length : 0;
    chip.textContent = `${count} images`;
    div.appendChild(label);
    div.appendChild(chip);
    container.appendChild(div);
  });
}

// Navigation between sections
function initNavigation() {
  const navItems = $all(".admin-nav-item");
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-section");
      navItems.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      $all(".admin-section").forEach((sec) => {
        sec.classList.remove("active");
      });
      const sectionEl = document.getElementById(`section-${target}`);
      if (sectionEl) sectionEl.classList.add("active");
    });
  });
}

// Wire basic form handlers (currently just toasts; APIs will be added separately)
function initForms() {
  const heroTextForm = $("#heroTextForm");
  if (heroTextForm) {
    heroTextForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleLine1 = $("#heroTitle1")?.value || "";
      const titleLine2 = $("#heroTitle2")?.value || "";
      const subtitle = $("#heroSubtitle")?.value || "";
      try {
        await fetch("/api/admin/hero", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titleLine1, titleLine2, subtitle }),
        });
        showToast("Hero content saved.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to save hero content.", "error");
      }
    });
  }

  const contactForm = $("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const primaryEmail = $("#contactEmail")?.value || "";
      const whatsappNumber = $("#whatsappNumber")?.value || "";
      try {
        await fetch("/api/admin/contact", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ primaryEmail, whatsappNumber }),
        });
        showToast("Contact settings saved.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to save contact settings.", "error");
      }
    });
  }

  const socialForm = $("#socialForm");
  if (socialForm) {
    socialForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const linkedin = $("#socialLinkedin")?.value || "";
      const instagram = $("#socialInstagram")?.value || "";
      const behance = $("#socialBehance")?.value || "";
      try {
        await fetch("/api/admin/social", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkedin, instagram, behance }),
        });
        showToast("Social links saved.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to save social links.", "error");
      }
    });
  }

  const seoForm = $("#seoForm");
  if (seoForm) {
    seoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const siteTitle = $("#siteTitle")?.value || "";
      const metaDescription = $("#metaDescription")?.value || "";
      const keywords = $("#metaKeywords")?.value || "";
      const canonicalUrl = $("#canonicalUrl")?.value || "";
      try {
        await fetch("/api/admin/seo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteTitle,
            metaDescription,
            keywords,
            canonicalUrl,
            ogImageUrl: null,
          }),
        });
        showToast("SEO settings saved.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to save SEO settings.", "error");
      }
    });
  }

  const heroImageForm = $("#heroImageForm");
  if (heroImageForm) {
    heroImageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fileInput = $("#heroImage");
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast("Please choose a hero image first.", "error");
        return;
      }
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      try {
        await fetch("/api/admin/upload/hero-image", {
          method: "POST",
          body: formData,
        });
        showToast("Hero image uploaded.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to upload hero image.", "error");
      }
    });
  }

  const brandingForm = $("#brandingForm");
  if (brandingForm) {
    brandingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const logoInput = $("#logoFile");
      const cvInput = $("#cvFile");
      const formData = new FormData();
      if (logoInput && logoInput.files && logoInput.files.length > 0) {
        formData.append("logoFile", logoInput.files[0]);
      }
      if (cvInput && cvInput.files && cvInput.files.length > 0) {
        formData.append("cvFile", cvInput.files[0]);
      }
      if (!formData.has("logoFile") && !formData.has("cvFile")) {
        showToast("Please choose a logo and/or CV file.", "error");
        return;
      }
      try {
        await fetch("/api/admin/upload/branding", {
          method: "POST",
          body: formData,
        });
        showToast("Brand assets uploaded.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to upload brand assets.", "error");
      }
    });
  }

  const showreelForm = $("#showreelForm");
  if (showreelForm) {
    showreelForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("#showreelFile");
      if (!input || !input.files || input.files.length === 0) {
        showToast("Please choose a showreel file.", "error");
        return;
      }
      const formData = new FormData();
      formData.append("file", input.files[0]);
      try {
        await fetch("/api/admin/upload/showreel", {
          method: "POST",
          body: formData,
        });
        showToast("Showreel uploaded.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to upload showreel.", "error");
      }
    });
  }

  const reelAddForm = $("#reelAddForm");
  if (reelAddForm) {
    reelAddForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleInput = $("#reelTitle");
      const fileInput = $("#reelFile");
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast("Please choose a reel video.", "error");
        return;
      }
      const formData = new FormData();
      formData.append("title", titleInput?.value || "");
      formData.append("file", fileInput.files[0]);
      try {
        await fetch("/api/admin/upload/reel", {
          method: "POST",
          body: formData,
        });
        showToast("Reel uploaded.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to upload reel.", "error");
      }
    });
  }

  const photoUploadForm = $("#photoUploadForm");
  if (photoUploadForm) {
    photoUploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const select = $("#photoCategorySelect");
      const filesInput = $("#photoFiles");
      const categoryId = select?.value;
      if (!categoryId) {
        showToast("Please select a category.", "error");
        return;
      }
      if (!filesInput || !filesInput.files || filesInput.files.length === 0) {
        showToast("Please choose at least one image.", "error");
        return;
      }
      const formData = new FormData();
      formData.append("categoryId", categoryId);
      Array.from(filesInput.files).forEach((file) => {
        formData.append("files", file);
      });
      try {
        await fetch("/api/admin/upload/photo", {
          method: "POST",
          body: formData,
        });
        showToast("Photos uploaded.", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to upload photos.", "error");
      }
    });
  }
}

function initLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // Clear cookie client-side by expiring it; server logout endpoint can be added later.
    document.cookie = "admin_session=; Max-Age=0; path=/";
    window.location.href = "/login.html";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  // Support both /admin and /admin.html so that Cloudflare Pages routing works
  if (path.endsWith("/admin") || path.endsWith("/admin.html")) {
    await ensureAuthenticated();
    initNavigation();
    initForms();
    initLogout();
    await loadConfig();
  }
});



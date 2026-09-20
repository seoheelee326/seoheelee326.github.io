const byId = (id) => document.getElementById(id);
let currentLang = "ko";
let cachedWorks = [];

function esc(v = "") {
  return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadJson(path, fallback) {
  try {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.warn(path, e);
    return fallback;
  }
}

function workTitle(work, lang) {
  return work["title_" + lang] || work.title || "";
}

function workMaterials(work, lang) {
  return work["materials_" + lang] || work.materials || "";
}

function artistName(work, lang) {
  return work["artist_" + lang] || (lang === "ko" ? "이서희" : "SEOHEE LEE");
}

function workSize(work) {
  if (work.height_cm && work.width_cm) {
    return work.height_cm + " × " + work.width_cm + " cm";
  }
  return work.dimensions || "";
}

function captionText(work, lang) {
  const first = [artistName(work, lang), workTitle(work, lang), work.year]
    .filter((v) => v !== "" && v !== null && v !== undefined)
    .join(", ");
  const second = [workMaterials(work, lang), workSize(work)]
    .filter(Boolean)
    .join(", ");
  return first + (second ? ". " + second : "") + ".";
}

function captionHtml(work) {
  return (
    '<span class="caption-ko">' +
    esc(captionText(work, "ko")) +
    '</span><span class="caption-en">' +
    esc(captionText(work, "en")) +
    "</span>"
  );
}

function renderHero(works) {
  const featured =
    works.find((x) => x.published !== false && x.featured === true) ||
    works.find((x) => x.published !== false);

  if (!featured) return;

  byId("hero-work-title").textContent = workTitle(featured, currentLang);
  byId("hero-work-caption").innerHTML = captionHtml(featured);

  const media = byId("hero-media");
  if (featured.image) {
    media.innerHTML =
      '<img src="' +
      esc(featured.image) +
      '" alt="' +
      esc(workTitle(featured, currentLang)) +
      '">';
  } else {
    media.innerHTML =
      '<div class="hero-placeholder">' +
      esc(workTitle(featured, currentLang)) +
      "</div>";
  }
}

function renderWorks(works) {
  const items = works.filter((x) => x.published !== false);
  byId("work-count").textContent = items.length + " works";

  byId("works-grid").innerHTML = items
    .map((work) => {
      const title = workTitle(work, currentLang);
      const media = work.image
        ? '<img src="' +
          esc(work.image) +
          '" alt="' +
          esc(title) +
          '" loading="lazy">'
        : '<div class="work-placeholder">' + esc(title) + "</div>";

      return (
        '<article class="work-card"><div class="work-media">' +
        media +
        '</div><p class="work-caption">' +
        captionHtml(work) +
        "</p></article>"
      );
    })
    .join("");
}

function renderProjects(projects, category, target) {
  const items = projects.filter(
    (x) => x.published !== false && x.category === category
  );
  const el = byId(target);

  if (!items.length) {
    el.innerHTML =
      '<div class="project-empty">Archive in progress — projects will be added here.</div>';
    return;
  }

  el.innerHTML = items
    .map(
      (item) =>
        '<article class="project-card"><div class="project-card-top"><span class="project-type">' +
        esc(item.type || category) +
        '</span><span class="project-year">' +
        esc(item.year || "") +
        "</span></div><h3>" +
        esc(item.title) +
        '</h3><div class="project-card-bottom"><p class="project-description">' +
        esc(item.description || "") +
        "</p><span>↘</span></div></article>"
    )
    .join("");
}

function renderExhibitions(items) {
  byId("exhibitions-list").innerHTML = items
    .filter((x) => x.published !== false)
    .map(
      (item) =>
        '<article class="exhibition-row"><p>' +
        esc(item.year) +
        '</p><p class="exhibition-title">' +
        esc(item.title) +
        '</p><p class="exhibition-place">' +
        esc(item.venue) +
        (item.location ? ", " + esc(item.location) : "") +
        '</p><p class="exhibition-type">' +
        esc(item.type) +
        "</p></article>"
    )
    .join("");
}

function applySite(site) {
  if (site.about) byId("about-text").textContent = site.about;
  if (site.instagram_url) byId("instagram-link").href = site.instagram_url;

  const email = byId("email-link");
  if (site.email) {
    email.href = "mailto:" + site.email;
    email.textContent = site.email;
  } else {
    email.removeAttribute("href");
  }
}

function setLanguage(lang) {
  currentLang = lang;
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang === "ko" ? "ko" : "en";
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  renderHero(cachedWorks);
  renderWorks(cachedWorks);
}

async function init() {
  const [site, works, exhibitions, projects] = await Promise.all([
    loadJson("data/site.json", {}),
    loadJson("data/works.json", []),
    loadJson("data/exhibitions.json", []),
    loadJson("data/projects.json", []),
  ]);

  cachedWorks = works;
  document.body.dataset.lang = currentLang;
  applySite(site);
  renderHero(works);
  renderWorks(works);
  renderProjects(projects, "Arts Education", "education-grid");
  renderProjects(projects, "Public Art", "public-grid");
  renderExhibitions(exhibitions);
  byId("current-year").textContent = new Date().getFullYear();
}

const menu = document.querySelector(".menu-button");
const nav = byId("site-nav");
const header = document.querySelector(".site-header");

menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  menu.textContent = open ? "Menu" : "Close";
  nav.classList.toggle("is-open", !open);
});

nav.addEventListener("click", () => {
  menu.setAttribute("aria-expanded", "false");
  menu.textContent = "Menu";
  nav.classList.remove("is-open");
});

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

addEventListener(
  "scroll",
  () => header.classList.toggle("scrolled", scrollY > innerHeight * 0.7),
  { passive: true }
);

init();
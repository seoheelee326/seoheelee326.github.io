const byId = (id) => document.getElementById(id);

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

function renderHero(works) {
  const featured =
    works.find((x) => x.published !== false && x.featured === true) ||
    works.find((x) => x.published !== false);

  if (!featured) return;

  byId("hero-work-title").textContent = featured.title || "";
  byId("hero-work-meta").textContent = [featured.year, featured.category]
    .filter(Boolean)
    .join(" · ");

  const media = byId("hero-media");
  if (featured.image) {
    media.innerHTML =
      '<img src="' +
      esc(featured.image) +
      '" alt="' +
      esc(featured.title) +
      '">';
  } else {
    media.innerHTML =
      '<div class="hero-placeholder">' + esc(featured.title) + "</div>";
  }
}

function renderWorks(works) {
  const items = works.filter((x) => x.published !== false);
  byId("work-count").textContent = items.length + " works";

  byId("works-grid").innerHTML = items
    .map((work) => {
      const title = esc(work.title);
      const media = work.image
        ? '<img src="' +
          esc(work.image) +
          '" alt="' +
          title +
          '" loading="lazy">'
        : '<div class="work-placeholder">' + title + "</div>";

      const details = [work.materials, work.dimensions]
        .filter(Boolean)
        .map(esc)
        .join(" · ");

      return (
        '<article class="work-card"><div class="work-media">' +
        media +
        '</div><div class="work-info"><div class="work-info-top"><h3>' +
        title +
        '</h3><p class="work-meta">' +
        esc(work.year) +
        " · " +
        esc(work.category) +
        "</p></div>" +
        (details ? '<p class="work-details">' + details + "</p>" : "") +
        "</div></article>"
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
        "<article class=\"exhibition-row\"><p>" +
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

async function init() {
  const [site, works, exhibitions, projects] = await Promise.all([
    loadJson("data/site.json", {}),
    loadJson("data/works.json", []),
    loadJson("data/exhibitions.json", []),
    loadJson("data/projects.json", []),
  ]);

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

addEventListener(
  "scroll",
  () => header.classList.toggle("scrolled", scrollY > innerHeight * 0.7),
  { passive: true }
);

init();
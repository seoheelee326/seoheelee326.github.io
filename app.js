const fallbackWorks = [];

const byId = (id) => document.getElementById(id);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("콘텐츠를 불러오지 못했습니다.", error);
    return fallback;
  }
}

function renderWorks(works) {
  const visibleWorks = works.filter((work) => work.published !== false);
  byId("work-count").textContent = `${visibleWorks.length} works`;
  byId("works-grid").innerHTML = visibleWorks
    .map((work) => {
      const title = escapeHtml(work.title);
      const image = work.image
        ? `<img src="${escapeHtml(work.image)}" alt="${title}" loading="lazy" />`
        : `<div class="work-placeholder" aria-label="${title} 이미지 준비 중">${title}</div>`;
      const materialLine = [work.materials, work.dimensions].filter(Boolean).map(escapeHtml).join(" · ");

      return `
        <article class="work-card">
          <div class="work-media">${image}</div>
          <div class="work-info">
            <h3>${title}</h3>
            <p class="work-meta">${escapeHtml(work.year)} · ${escapeHtml(work.category)}</p>
            ${materialLine ? `<p class="work-details">${materialLine}</p>` : ""}
          </div>
        </article>`;
    })
    .join("");
}

function renderExhibitions(exhibitions) {
  const visibleExhibitions = exhibitions.filter((item) => item.published !== false);
  byId("exhibitions-list").innerHTML = visibleExhibitions
    .map(
      (item) => `
        <article class="exhibition-row">
          <p>${escapeHtml(item.year)}</p>
          <p class="exhibition-title">${escapeHtml(item.title)}</p>
          <p class="exhibition-place">${escapeHtml(item.venue)}${item.location ? `, ${escapeHtml(item.location)}` : ""}</p>
          <p class="exhibition-type">${escapeHtml(item.type)}</p>
        </article>`,
    )
    .join("");
}

function applySiteSettings(site) {
  if (site.intro) byId("intro-text").textContent = site.intro;
  if (site.about) byId("about-text").textContent = site.about;
  const emailLink = byId("email-link");
  if (site.email) {
    emailLink.href = `mailto:${site.email}`;
  } else {
    emailLink.removeAttribute("href");
    emailLink.textContent = "Email coming soon";
  }
  if (site.instagram_url) byId("instagram-link").href = site.instagram_url;
}

async function init() {
  const [site, works, exhibitions] = await Promise.all([
    loadJson("data/site.json", {}),
    loadJson("data/works.json", fallbackWorks),
    loadJson("data/exhibitions.json", []),
  ]);

  applySiteSettings(site);
  renderWorks(works);
  renderExhibitions(exhibitions);
  byId("current-year").textContent = new Date().getFullYear();
}

const menuButton = document.querySelector(".menu-button");
const nav = byId("site-nav");

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.textContent = isOpen ? "Menu" : "Close";
  nav.classList.toggle("is-open", !isOpen);
});

nav.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.textContent = "Menu";
  nav.classList.remove("is-open");
});

init();

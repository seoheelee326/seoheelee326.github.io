const byId = (id) => document.getElementById(id);
let currentLang = "ko";
let cached = { site: {}, works: [], exhibitions: [], projects: [] };

const ui = {
  ko: {
    nav_artwork: "작업",
    nav_education: "문화예술교육",
    nav_public: "공공미술",
    nav_about: "소개",
    featured_work: "대표작",
    view_work: "작업 보기",
    practice_artwork: "작업",
    practice_artwork_sub: "회화 · 설치 · 미디어",
    practice_education: "문화예술교육",
    practice_education_sub: "참여 · 학습 · 기후",
    practice_public: "공공미술",
    practice_public_sub: "장소 · 공동체 · 생태",
    artwork_kicker: "01 / 작업",
    selected_works: "주요 작업",
    education_kicker: "02 / 문화예술교육",
    programs_title: "프로그램 & 워크숍",
    education_note: "예술을 통해 관찰하고, 이해하고, 참여하는 방법을 탐색합니다.",
    public_kicker: "03 / 공공미술",
    public_title: "공공 프로젝트",
    public_note: "장소, 공동체, 생태적 질문을 연결하는 프로젝트입니다.",
    archive: "아카이브",
    exhibitions_title: "전시",
    about_kicker: "소개",
    about_heading: "예술, 장소,<br>그리고 생태.",
    based_in: "활동 지역",
    practice_label: "작업 영역",
    footer_title: "예술, 장소,<br>그리고 생태.",
    works_suffix: "점",
    empty: "아카이브를 준비 중입니다."
  },
  en: {
    nav_artwork: "Artwork",
    nav_education: "Arts Education",
    nav_public: "Public Art",
    nav_about: "About",
    featured_work: "Featured work",
    view_work: "View work",
    practice_artwork: "Artwork",
    practice_artwork_sub: "Painting · Installation · Media",
    practice_education: "Arts Education",
    practice_education_sub: "Participation · Learning · Climate",
    practice_public: "Public Art",
    practice_public_sub: "Place · Community · Ecology",
    artwork_kicker: "01 / Artwork",
    selected_works: "Selected Works",
    education_kicker: "02 / Arts Education",
    programs_title: "Programs & Workshops",
    education_note: "Art as a way to observe, understand, and participate.",
    public_kicker: "03 / Public Art",
    public_title: "Public Projects",
    public_note: "Projects connecting place, community, and ecological questions.",
    archive: "Archive",
    exhibitions_title: "Exhibitions",
    about_kicker: "About",
    about_heading: "Art, place,<br>and ecology.",
    based_in: "Based in",
    practice_label: "Practice",
    footer_title: "Art, place,<br>and ecology.",
    works_suffix: "works",
    empty: "Archive in progress."
  }
};

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

function titleFor(work, lang) {
  const original = work.title || "";
  const translation = work.title_translation_en || "";
  if (lang === "en" && translation && translation.toLowerCase() !== original.toLowerCase()) {
    return original + " (" + translation + ")";
  }
  return original;
}

function artistName(work, lang) {
  return lang === "ko"
    ? (work.artist_ko || "이서희")
    : (work.artist_en || "SEOHEE LEE");
}

function materialsFor(work, lang) {
  return lang === "ko"
    ? (work.materials_ko || "")
    : (work.materials_en || "");
}

function workSize(work) {
  return work.height_cm && work.width_cm
    ? work.height_cm + " × " + work.width_cm + " cm"
    : "";
}

function captionText(work, lang) {
  const first = [artistName(work, lang), titleFor(work, lang), work.year]
    .filter((v) => v !== "" && v !== null && v !== undefined)
    .join(", ");
  const second = [materialsFor(work, lang), workSize(work)].filter(Boolean).join(", ");
  return first + (second ? ". " + second : "") + ".";
}

function renderHero() {
  const works = cached.works;
  const featured =
    works.find((x) => x.published !== false && x.featured === true) ||
    works.find((x) => x.published !== false);

  if (!featured) return;

  const title = titleFor(featured, currentLang);
  byId("hero-work-title").textContent = title;
  byId("hero-work-caption").textContent = captionText(featured, currentLang);

  const media = byId("hero-media");
  media.innerHTML = featured.image
    ? '<img src="' + esc(featured.image) + '" alt="' + esc(title) + '">'
    : '<div class="hero-placeholder">' + esc(title) + "</div>";
}

function renderWorks() {
  const items = cached.works.filter((x) => x.published !== false);
  byId("work-count").textContent =
    currentLang === "ko"
      ? items.length + ui.ko.works_suffix
      : items.length + " " + ui.en.works_suffix;

  byId("works-grid").innerHTML = items.map((work) => {
    const title = titleFor(work, currentLang);
    const media = work.image
      ? '<img src="' + esc(work.image) + '" alt="' + esc(title) + '" loading="lazy">'
      : '<div class="work-placeholder">' + esc(title) + "</div>";
    return '<article class="work-card"><button class="work-card-button" type="button" data-work-index="' +
      cached.works.indexOf(work) +
      '"><div class="work-media">' +
      media +
      '</div><div class="work-card-meta"><p class="work-card-title">' +
      esc(title) +
      '</p><p class="work-card-year">' +
      esc(work.year) +
      "</p></div></button></article>";
  }).join("");
}

function local(item, field) {
  return item[field + "_" + currentLang] || item[field] || "";
}

function renderProjects(category, target) {
  const items = cached.projects.filter(
    (x) => x.published !== false && x.category === category
  );
  const el = byId(target);

  if (!items.length) {
    el.innerHTML = '<div class="project-empty">' + esc(ui[currentLang].empty) + "</div>";
    return;
  }

  el.innerHTML = items.map((item) =>
    '<article class="project-card"><div class="project-card-top"><span class="project-type">' +
    esc(local(item, "type") || category) +
    '</span><span class="project-year">' +
    esc(item.year || "") +
    "</span></div><h3>" +
    esc(local(item, "title")) +
    '</h3><div class="project-card-bottom"><p class="project-description">' +
    esc(local(item, "description")) +
    "</p><span>↘</span></div></article>"
  ).join("");
}

function renderExhibitions() {
  byId("exhibitions-list").innerHTML = cached.exhibitions
    .filter((x) => x.published !== false)
    .map((item) =>
      '<article class="exhibition-row"><p>' +
      esc(item.year) +
      '</p><p class="exhibition-title">' +
      esc(local(item, "title")) +
      '</p><p class="exhibition-place">' +
      esc(local(item, "venue")) +
      (local(item, "location") ? ", " + esc(local(item, "location")) : "") +
      '</p><p class="exhibition-type">' +
      esc(local(item, "type")) +
      "</p></article>"
    ).join("");
}

function renderSiteText() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = ui[currentLang][el.dataset.i18n] || "";
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = ui[currentLang][el.dataset.i18nHtml] || "";
  });

  const site = cached.site;
  byId("about-text").textContent =
    site["about_" + currentLang] || site.about || "";
  byId("based-in-value").textContent =
    site["based_in_" + currentLang] || (currentLang === "ko" ? "대한민국 남양주" : "Namyangju, Korea");
  byId("practice-value").textContent =
    site["practice_" + currentLang] ||
    (currentLang === "ko"
      ? "회화 · 설치 · 미디어 · 문화예술교육 · 공공미술"
      : "Painting · Installation · Media · Arts Education · Public Art");

  if (site.instagram_url) byId("instagram-link").href = site.instagram_url;

  const email = byId("email-link");
  if (site.email) {
    email.href = "mailto:" + site.email;
    email.textContent = site.email;
  } else {
    email.removeAttribute("href");
    email.textContent = currentLang === "ko" ? "이메일 준비 중" : "Email coming soon";
  }
}

function renderAll() {
  renderSiteText();
  renderHero();
  renderWorks();
  renderProjects("Arts Education", "education-grid");
  renderProjects("Public Art", "public-grid");
  renderExhibitions();
  bindWorkCards();
}

function openWorkDetail(index) {
  const work = cached.works[index];
  if (!work) return;

  const title = titleFor(work, currentLang);
  const detail = byId("work-detail");
  const mainMedia = byId("detail-main-media");
  const gallery = Array.isArray(work.gallery) ? work.gallery : [];

  byId("detail-kicker").textContent =
    currentLang === "ko" ? "작품 상세" : "Work detail";
  byId("detail-title").textContent = title;
  byId("detail-caption").textContent = captionText(work, currentLang);
  byId("detail-description").textContent =
    work["description_" + currentLang] || "";

  mainMedia.innerHTML = work.image
    ? '<img src="' + esc(work.image) + '" alt="' + esc(title) + '">'
    : '<div class="work-placeholder">' + esc(title) + "</div>";

  byId("detail-gallery").innerHTML = gallery
    .filter(Boolean)
    .map((src, i) =>
      '<img src="' + esc(src) + '" alt="' + esc(title) + ' ' + (i + 1) + '" loading="lazy">'
    )
    .join("");

  detail.dataset.workIndex = index;
  detail.classList.add("is-open");
  detail.setAttribute("aria-hidden", "false");
  document.body.classList.add("detail-open");
  history.replaceState(null, "", "#work-" + index);
}

function closeWorkDetail() {
  const detail = byId("work-detail");
  detail.classList.remove("is-open");
  detail.setAttribute("aria-hidden", "true");
  document.body.classList.remove("detail-open");
  history.replaceState(null, "", "#artwork");
}

function bindWorkCards() {
  document.querySelectorAll(".work-card-button").forEach((button) => {
    button.addEventListener("click", () => {
      openWorkDetail(Number(button.dataset.workIndex));
    });
  });
}

function setLanguage(lang) {
  currentLang = lang;
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang === "ko" ? "ko" : "en";
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  renderAll();

  const activeDetail = byId("work-detail");
  if (activeDetail && activeDetail.classList.contains("is-open")) {
    const index = Number(activeDetail.dataset.workIndex);
    if (!Number.isNaN(index)) openWorkDetail(index);
  }
}

async function init() {
  const [site, works, exhibitions, projects] = await Promise.all([
    loadJson("data/site.json", {}),
    loadJson("data/works.json", []),
    loadJson("data/exhibitions.json", []),
    loadJson("data/projects.json", []),
  ]);

  cached = { site, works, exhibitions, projects };
  document.body.dataset.lang = currentLang;
  renderAll();
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

byId("work-detail-close").addEventListener("click", closeWorkDetail);
byId("work-detail").addEventListener("click", (event) => {
  if (event.target.id === "work-detail") closeWorkDetail();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && byId("work-detail").classList.contains("is-open")) {
    closeWorkDetail();
  }
});

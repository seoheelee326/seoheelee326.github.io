const byId = (id) => document.getElementById(id);
let currentLang = "ko";
let cached = { site: {}, works: [], exhibitions: [], projects: [] };

const ui = {
  ko: {
    nav_artwork: "Work",
    nav_education: "Arts Education",
    nav_public: "Public Art",
    nav_about: "About",
    featured_work: "Featured work",
    view_work: "Explore works",
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
  },
  en: {
    nav_artwork: "Work",
    nav_education: "Arts Education",
    nav_public: "Public Art",
    nav_about: "About",
    featured_work: "Featured work",
    view_work: "Explore works",
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
  if (featured.image) {
    media.innerHTML = '<img src="' + esc(featured.image) + '" alt="' + esc(title) + '">';
  } else {
    const cubes = Array.from({ length: 9 }, () => '<i></i>').join("");
    media.innerHTML =
      '<div class="hero-placeholder" aria-hidden="true">' +
      '<span class="hero-placeholder-index">FEATURED / ' + esc(featured.year || "") + '</span>' +
      '<span class="hero-placeholder-pattern"></span>' +
      '<span class="hero-placeholder-cubes">' + cubes + '</span>' +
      '<span class="hero-placeholder-year">' + esc(featured.year || "") + '</span>' +
      '</div>';
  }
}

function renderWorks() {
  const items = cached.works.filter((x) => x.published !== false);
  byId("work-count").textContent = items.length + " works";

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
    email.textContent = "Email coming soon";
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

  byId("detail-kicker").textContent = "Work detail";
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

function openSection(targetId) {
  const target = byId(targetId);
  if (!target) return;

  document.body.classList.add("content-open");
  history.pushState({ view: "content" }, "", "#" + targetId);
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function returnHome() {
  document.body.classList.remove("content-open");
  history.pushState({ view: "home" }, "", window.location.pathname + window.location.search);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncViewFromLocation() {
  const targetId = window.location.hash.slice(1);
  if (!targetId || targetId === "top") {
    document.body.classList.remove("content-open");
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  document.body.classList.add("content-open");
  const target = byId(targetId);
  if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: "auto", block: "start" }));
}

function initHomeNavigation() {
  syncViewFromLocation();

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute("href").slice(1);
    if (targetId === "top") {
      event.preventDefault();
      returnHome();
      return;
    }

    if (!byId(targetId)) return;
    if (!document.body.classList.contains("content-open")) {
      event.preventDefault();
      openSection(targetId);
    }
  });

  window.addEventListener("popstate", syncViewFromLocation);
}

function initIntro() {
  const homeAtEntry = !window.location.hash || window.location.hash === "#top";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem("seohee-home-intro") === "seen";
    sessionStorage.setItem("seohee-home-intro", "seen");
  } catch (error) {
    alreadySeen = false;
  }

  if (homeAtEntry && !alreadySeen && !reducedMotion) {
    document.body.classList.add("intro-active");
    window.setTimeout(() => {
      document.body.classList.remove("intro-active");
      document.body.classList.add("intro-ready");
    }, 700);
  } else {
    document.body.classList.add("intro-ready");
  }
}

function initCubicCursor() {
  const canvas = byId("cubic-cursor");
  const context = canvas && canvas.getContext("2d");
  const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || !context || !desktopPointer || reducedMotion) return;

  document.body.classList.add("has-cubic-cursor");
  const stones = Array.from({ length: 9 }, () => ({ x: 0, y: 0 }));
  const spacing = 15;
  const pointer = { x: 0, y: 0 };
  let active = false;
  let initialized = false;
  let sparkleStarted = -Infinity;
  let animationFrame = 0;
  let pixelRatio = 1;

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawStone(stone, index, shine) {
    const size = index === 0 ? 5.6 : 4.7;
    const x = stone.x;
    const y = stone.y;
    const top = { x, y: y - size * 0.9 };
    const left = { x: x - size, y: y - size * 0.25 };
    const right = { x: x + size, y: y - size * 0.25 };
    const front = { x, y: y + size * 0.42 };
    const lowerLeft = { x: x - size, y: y + size * 0.82 };
    const lowerRight = { x: x + size, y: y + size * 0.82 };
    const bottom = { x, y: y + size * 1.38 };

    context.save();
    context.lineWidth = 0.55;
    context.lineJoin = "round";
    context.shadowColor = "rgba(255,255,255," + (shine * 0.9) + ")";
    context.shadowBlur = shine * 15;

    context.beginPath();
    context.moveTo(left.x, left.y);
    context.lineTo(front.x, front.y);
    context.lineTo(bottom.x, bottom.y);
    context.lineTo(lowerLeft.x, lowerLeft.y);
    context.closePath();
    context.fillStyle = "rgba(161,157,148,.95)";
    context.fill();
    context.strokeStyle = "rgba(60,58,54,.62)";
    context.stroke();

    context.beginPath();
    context.moveTo(front.x, front.y);
    context.lineTo(right.x, right.y);
    context.lineTo(lowerRight.x, lowerRight.y);
    context.lineTo(bottom.x, bottom.y);
    context.closePath();
    context.fillStyle = "rgba(222,219,212,.98)";
    context.fill();
    context.stroke();

    context.beginPath();
    context.moveTo(left.x, left.y);
    context.lineTo(top.x, top.y);
    context.lineTo(right.x, right.y);
    context.lineTo(front.x, front.y);
    context.closePath();
    context.fillStyle = "rgba(255,255,255," + (0.96 + shine * 0.04) + ")";
    context.fill();
    context.strokeStyle = "rgba(80,78,72,.58)";
    context.stroke();

    if (shine > 0.12) {
      context.globalAlpha = Math.min(1, shine);
      context.strokeStyle = "rgba(255,255,255,.98)";
      context.lineWidth = 1.15;
      context.beginPath();
      context.moveTo(x, y - size * 0.6);
      context.lineTo(x, y + size * 0.25);
      context.moveTo(x - size * 0.55, y - size * 0.18);
      context.lineTo(x + size * 0.55, y - size * 0.18);
      context.stroke();
    }
    context.restore();
  }

  function draw(now) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!active) {
      animationFrame = 0;
      return;
    }

    if (!initialized) {
      stones.forEach((stone, index) => {
        stone.x = pointer.x - spacing * index;
        stone.y = pointer.y;
      });
      initialized = true;
    }

    let moving = false;
    stones[0].x += (pointer.x - stones[0].x) * 0.44;
    stones[0].y += (pointer.y - stones[0].y) * 0.44;
    if (Math.hypot(pointer.x - stones[0].x, pointer.y - stones[0].y) > 0.16) moving = true;

    for (let index = 1; index < stones.length; index += 1) {
      const previous = stones[index - 1];
      const stone = stones[index];
      const dx = previous.x - stone.x;
      const dy = previous.y - stone.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0.001) {
        const correction = (distance - spacing) * 0.42;
        stone.x += (dx / distance) * correction;
        stone.y += (dy / distance) * correction;
      }
      if (Math.abs(distance - spacing) > 0.15) moving = true;
    }

    const sparkleProgress = (now - sparkleStarted) / 680;
    if (sparkleProgress >= 0 && sparkleProgress <= 1) moving = true;
    for (let index = stones.length - 1; index >= 0; index -= 1) {
      const sweepPosition = sparkleProgress * (stones.length + 1) - 1;
      const shine = sparkleProgress >= 0 && sparkleProgress <= 1
        ? Math.exp(-Math.pow((index - sweepPosition) / 0.78, 2))
        : 0;
      drawStone(stones[index], index, shine);
    }

    if (moving) animationFrame = window.requestAnimationFrame(draw);
    else animationFrame = 0;
  }

  function scheduleDraw() {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    active = true;
    scheduleDraw();
  }, { passive: true });
  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    sparkleStarted = performance.now();
    scheduleDraw();
  }, { passive: true });
  window.addEventListener("blur", () => {
    active = false;
    if (!animationFrame) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  });
  resizeCanvas();
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

initIntro();
initHomeNavigation();
initCubicCursor();

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

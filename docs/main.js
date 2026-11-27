const params = new URLSearchParams(location.search);
const motion = !["off", "reduce"].includes(params.get("motion"));
const scaleContainer = document.querySelector(".page-scale");
const introBanner = document.querySelector(".pre-main");
let lastScale;
function fit() {
  const next = Math.min(1, document.documentElement.getBoundingClientRect().width / 1920);
  const nextY = lastScale ? scrollY * next / lastScale : scrollY;
  document.documentElement.style.setProperty("--page-scale", next);
  if (lastScale && lastScale !== next && !document.documentElement.classList.contains("story-active")) scrollTo(0, nextY);
  lastScale = next;
}
fit();
addEventListener("resize", fit);
if (motion) document.documentElement.classList.add("explicit-motion");
function setMotionDuration(value) {
  const duration = Number(value);
  if (duration) document.documentElement.style.setProperty("--motion-duration", Math.max(400, Math.min(1600, duration)) + "ms");
  else document.documentElement.style.removeProperty("--motion-duration");
}
setMotionDuration(params.get("duration"));
if (motion) document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.06 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  document.documentElement.classList.add("motion-active");
}, { once: true });
for (const range of document.querySelectorAll(".comparison-range")) {
  const box = range.closest(".comparison");
  range.addEventListener("input", () => {
    box.style.setProperty("--split", range.value + "%");
    box.classList.add("is-adjusting");
    range.setAttribute("aria-valuetext", `치료 전 ${range.value}%, 치료 후 ${100 - range.value}%`);
  });
}
const topButton = document.querySelector(".back-top");
let scheduled = false;
const layoutSections = params.get("motion") === "off" && parent !== window ? ["top", "philosophy", "doctors", "centers", "cases", "reviews", "information"].map((id) => document.getElementById(id)).filter(Boolean) : [];
let lastLayoutSection;
function reportLayoutPosition() {
  if (!layoutSections.length) return;
  let id = "top";
  for (const section of layoutSections) if (section.getBoundingClientRect().top <= innerHeight * 0.3) id = section.id;
  if (id === lastLayoutSection) return;
  lastLayoutSection = id;
  parent.postMessage({ type: "preview-active-section", id }, "*");
}
function updateScroll() {
  scheduled = false;
  reportLayoutPosition();
  const showTop = scrollY > (introBanner?.offsetHeight || 0) + 400;
  if (topButton.inert === showTop) topButton.inert = !showTop;
  topButton.classList.toggle("visible", showTop);
  if (motion && !document.documentElement.classList.contains("story-active")) {
    const plan = document.querySelector(".plan-image");
    const r = plan.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
    plan.style.setProperty("--plan-shift", `${progress * 22}px`);
  }
}
function scheduleScrollUpdate() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateScroll);
  }
}
addEventListener("scroll", scheduleScrollUpdate, { passive: true });
addEventListener("resize", scheduleScrollUpdate);
updateScroll();
let navigationToken = 0, navigationStarted = false;
function cancelNavigationFocus() {
  navigationStarted = true;
  navigationToken++;
}
for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) addEventListener(type, cancelNavigationFocus, { capture: true, passive: true });
function focusSection(target, token) {
  const heading = target.id === "main" ? target : target.querySelector("h1,h2") || target;
  let lastY = scrollY, stable = 0, frames = 0;
  function finish() {
    if (token !== navigationToken) return;
    stable = Math.abs(scrollY - lastY) < 0.5 ? stable + 1 : 0;
    lastY = scrollY;
    if (stable >= 5 && !heading.closest("[inert]")) {
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      return;
    }
    if (++frames < 180) requestAnimationFrame(finish);
  }
  requestAnimationFrame(finish);
}
function navigateSection(id, { focus = false, remember = false, instant = false, review = false } = {}) {
  const target = document.getElementById(id);
  if (!target || !["main", "top", "philosophy", "questions", "doctors", "centers", "cases", "reviews", "information"].includes(id)) return false;
  navigationStarted = true;
  const token = ++navigationToken;
  const openDetail = document.querySelector("#detail-dialog[open]");
  openDetail?.close();
  if (remember && location.hash !== "#" + id) {
    try {
      history.pushState(history.state, "", "#" + id);
    } catch {
      location.hash = id;
    }
  }
  if (!window.storyNavigate?.(id, { instant })) {
    const header = document.querySelector(".story-header");
    const titleOffset = id === "information" ? (target.querySelector('[data-node-id="986:263"]')?.offsetTop || 0) * lastScale - 12 : 0;
    const top = ["main", "top"].includes(id) ? scrollY + scaleContainer.getBoundingClientRect().top : scrollY + target.getBoundingClientRect().top + titleOffset - (header?.getBoundingClientRect().height || 0);
    scrollTo({ top: Math.max(0, top), behavior: instant || !motion ? "instant" : "smooth" });
  }
  if (focus) focusSection(target, token);
  if (review && openDetail) parent.postMessage({ type: "preview-section-focus", id }, "*");
  return true;
}
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor || anchor.hasAttribute("download") || anchor.target && anchor.target !== "_self") return;
  const instant = anchor.classList.contains("scroll-guide-link") && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (navigateSection(anchor.hash.slice(1), { focus: true, remember: true, instant })) event.preventDefault();
});
addEventListener("hashchange", () => {
  if (!location.hash && introBanner) {
    cancelNavigationFocus();
    return;
  }
  navigateSection(location.hash.slice(1) || "top", { focus: true, instant: true });
});
const pageLoaded = document.readyState === "complete" ? Promise.resolve() : new Promise((resolve) => addEventListener("load", resolve, { once: true }));
Promise.all([pageLoaded, document.fonts.ready]).then(() => {
  requestAnimationFrame(() => {
    if (location.hash && !navigationStarted) navigateSection(location.hash.slice(1), { focus: true, instant: true });
    scheduleScrollUpdate();
  });
});
topButton.onclick = () => navigateSection("top", { focus: true, remember: true });
const live = "https://xn--vb0b361auxcoxcy0lw9h.com";
const dialog = document.querySelector("#detail-dialog");
const title = document.querySelector("#dialog-title");
const body = document.querySelector("#dialog-body");
const destination = document.querySelector("#dialog-link");
const dialogSource = document.querySelector("#dialog-source");
function showDetail(heading, copy, url, sourceDocument = null) {
  delete dialog.dataset.doctorId;
  title.textContent = heading;
  body.textContent = copy;
  destination.href = url || live;
  destination.textContent = sourceDocument?.linkLabel || ((url || "").startsWith("tel:") ? "전화 문의하기" : "현재 홈페이지에서 보기 ↗");
  dialog.classList.toggle("source-document", !!sourceDocument);
  dialogSource.hidden = !sourceDocument;
  dialogSource.textContent = sourceDocument?.source || "";
  for (const name of ["aria-label", "aria-labelledby"]) body.removeAttribute(name);
  body.tabIndex = 0;
  body.setAttribute("role", "region");
  if (sourceDocument) body.setAttribute("aria-label", heading + " 원문");
  else body.setAttribute("aria-labelledby", "dialog-title");
  scrollTo({ top: scrollY, left: scrollX, behavior: "instant" });
  document.documentElement.classList.add("detail-open");
  dialog.showModal();
  body.scrollTop = 0;
  if (sourceDocument) {
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  }
  document.dispatchEvent(new Event("detail-visibility-change"));
}
dialog.addEventListener("close", () => {
  document.documentElement.classList.remove("detail-open");
  document.dispatchEvent(new Event("detail-visibility-change"));
});
document.querySelector(".dialog-close").onclick = () => dialog.close();
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  }
});
const doctors = {
  "986:449": ["임재형 · 심미치료 센터장", "치과교정과 전문의\n\n치아의 배열과 맞물림이 조화를 이루도록 치아의 위치와 교합을 함께 살펴, 기능과 균형을 고려한 교정치료를 계획합니다."],
  "986:465": ["강명범 · 대표원장", "치주과 전문의 · 통합치의학과 전문의\n임플란트 수술 센터장\n\n자연치아를 오래 지킬 수 있도록 치아를 받치는 잇몸부터 살펴, 자연치아를 보존할 가능성을 고민합니다."],
  "986:481": ["박슬지 · 보철·보존 센터장", "치과보존과 전문의\n\n편안하게 씹고 자연스럽게 웃을 수 있도록 씹는 기능과 치아의 모양을 함께 고려해, 환자분께 맞는 보철치료를 계획합니다."]
};
const doctorDetails = (b) => b.dataset.previewHeading ? [b.dataset.previewHeading, b.dataset.previewCopy] : doctors[b.dataset.doctor];
const doctorButtons = [...document.querySelectorAll("[data-doctor]")];
function labelDoctorButtons() {
  for (const button of doctorButtons) {
    const [heading] = doctorDetails(button);
    button.setAttribute("aria-label", heading + " 상세 보기 · " + button.textContent.trim());
  }
}
labelDoctorButtons();
doctorButtons.forEach((b) => b.onclick = () => {
  showDetail(...doctorDetails(b), live + "/sub/story.php");
  dialog.dataset.doctorId = b.dataset.doctor;
});
document.addEventListener("doctor-preview-change", () => {
  labelDoctorButtons();
  if (!dialog.open || !dialog.dataset.doctorId) return;
  const button = [...document.querySelectorAll("[data-doctor]")].find((b) => b.dataset.doctor === dialog.dataset.doctorId);
  if (button) {
    const [heading, copy] = doctorDetails(button);
    title.textContent = heading;
    body.textContent = copy;
  }
});
document.querySelectorAll("[data-center]").forEach((b) => b.onclick = () => showDetail(b.dataset.center, b.dataset.center === "수술센터" ? "어려운 치료가 필요해져도 독립된 수술실과 수술 준비 공간을 갖춰 임플란트와 복잡한 수술까지 이어서 진료합니다." : "치료 계획부터 사후관리까지, 한곳에서 이어지는 진료.\n각 분야의 전문의가 치료의 과정과 그 이후를 함께 생각합니다.", live + "/sub/story.php"));
const details = { guarantee: ["안심보증시스템", "자세한 보증 안내는 치과로 문의해 주세요.", "tel:050713692882"], privacy: ["개인정보처리방침", "개인정보처리방침은 현재 홈페이지에서 확인하실 수 있습니다.", live], fees: ["비급여 안내", "비급여 진료비는 치과에 문의하여 확인해 주세요.", "tel:050713692882"] };
document.querySelectorAll("[data-dialog]").forEach((b) => b.onclick = () => {
  const source = window.clinicFooterContent?.[b.dataset.dialog];
  if (source) showDetail(source.title, source.body, source.url, source);
  else showDetail(...details[b.dataset.dialog]);
});
addEventListener("message", (event) => {
  if (event.source !== parent || !event.data || event.data.type !== "preview-section") return;
  navigateSection(event.data.id, { review: true });
});
addEventListener("message", (event) => {
  if (event.source !== parent || event.data?.type !== "preview-speed") return;
  setMotionDuration(event.data.duration);
  if (!motion) return;
  const visible = [...document.querySelectorAll("#doctors .reveal.is-visible")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  });
  visible.forEach((el) => el.classList.remove("is-visible"));
  requestAnimationFrame(() => requestAnimationFrame(() => visible.forEach((el) => el.classList.add("is-visible"))));
});

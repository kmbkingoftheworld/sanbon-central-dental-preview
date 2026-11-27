(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  if (params.get("motion") === "off") return;
  const staticStory = params.get("motion") === "reduce";
  const config = window.SANBON_STORY || {}, root = document.documentElement;
  const hero = document.querySelector("#top"), philosophy = document.querySelector("#philosophy");
  const doctors = document.querySelector("#doctors"), centers = document.querySelector("#centers"), cases = document.querySelector("#cases");
  if (!hero || !philosophy || !doctors || !centers || !cases) return;
  root.classList.add("story-active");
  root.classList.toggle("story-reduced", staticStory);
  const header = document.createElement("div");
  header.className = "story-header";
  const headerDesign = document.createElement("div");
  headerDesign.className = "story-header-design";
  headerDesign.append(hero.querySelector("header"));
  const headerNav = headerDesign.querySelector("nav");
  const menuToggle = document.createElement("button");
  headerNav.id = "clinic-navigation";
  menuToggle.type = "button";
  menuToggle.className = "specialty-menu-toggle";
  menuToggle.textContent = "메뉴";
  menuToggle.setAttribute("aria-controls", headerNav.id);
  const setMenu = (open) => menuToggle.setAttribute("aria-expanded", String(open));
  setMenu(false);
  headerNav.before(menuToggle);
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  headerNav.addEventListener("click", () => setMenu(false));
  document.addEventListener("pointerdown", event => {
    if (menuToggle.getAttribute("aria-expanded") === "true" && !headerDesign.contains(event.target)) setMenu(false);
  }, { passive: true });
  headerDesign.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuToggle.focus({ preventScroll: true });
    }
  });
  header.append(headerDesign);
  const pageScale = document.querySelector(".page-scale");
  document.getElementById("main").before(header);
  const intro = document.createElement("section");
  intro.id = "intro-story";
  intro.className = "intro-story";
  intro.setAttribute("aria-label", "20년 뒤를 위한 치료 이야기");
  philosophy.before(intro);
  const stage = document.createElement("div");
  stage.className = "intro-stage";
  intro.append(stage);
  stage.append(philosophy);
  philosophy.querySelector('[data-node-id="986:490"] p:last-child').textContent = "해소하는 것에서 출발합니다.";
  const questions = document.createElement("section");
  questions.id = "questions";
  questions.className = "story-questions";
  questions.setAttribute("aria-label", "확인하고 싶은 네 가지");
  const questionTitle = document.createElement("h2");
  questionTitle.textContent = "확인하고 싶은 건 결국 비슷합니다.";
  const eyebrow = document.createElement("p");
  eyebrow.className = "questions-eyebrow";
  eyebrow.textContent = "가까이에서, 오래 믿고 다닐 치과를 고를 때,";
  const grid = document.createElement("div");
  grid.className = "question-grid";
  questions.append(eyebrow, questionTitle, grid);
  (Array.isArray(config.questions) ? config.questions : []).forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "question-card";
    article.dataset.sourceNodes = (item.sourceNodes || []).join(",");
    const number = document.createElement("span");
    number.className = "question-number";
    number.textContent = String(index + 1).padStart(2, "0");
    number.setAttribute("aria-hidden", "true");
    const title = document.createElement("h3");
    title.textContent = item.title;
    const text = document.createElement("p");
    text.textContent = item.description;
    article.append(number, title, text);
    grid.append(article);
  });
  stage.append(questions);
  const cards = [...grid.children];
  const doctorCards = ["986:439", "986:471", "986:455"].map((id) => doctors.querySelector(`[data-node-id="${id}"]`));
  const doctorProgress = doctorCards.map(() => null);
  const doctorGroup = doctors.querySelector('[data-node-id="986:432"]');
  const doctorSpecialties = doctors.querySelector('[data-node-id="990:3818"]');
  const doctorTimeline = document.createElement("div"), doctorStage = document.createElement("div");
  const doctorBody = document.createElement("div");
  const doctorCardStart = (index) => 0.2 + index * 0.82;
  const doctorRevealLength = 0.64;
  doctorTimeline.className = "doctor-timeline";
  doctorStage.className = "doctor-stage";
  doctorBody.className = "doctor-body";
  if (!staticStory) {
    doctorGroup.before(doctorTimeline);
    doctorTimeline.append(doctorStage);
    doctorStage.append(doctorSpecialties, doctorBody);
    doctorBody.append(doctorGroup);
    doctorCards.forEach((card) => {
      card.classList.remove("reveal");
      card.classList.add("doctor-scroll-card");
    });
  }
  const comparisonHelp = document.createElement("p");
  comparisonHelp.id = "comparison-help";
  comparisonHelp.className = "comparison-help";
  comparisonHelp.textContent = "손잡이를 좌우로 움직여 치료 전후를 비교해 보세요.";
  cases.querySelector('[data-node-id="986:76"]').before(comparisonHelp);
  cases.querySelector('[data-node-id="986:129"]').textContent = "02";
  cases.querySelectorAll(".comparison").forEach((box) => {
    const range = box.querySelector(".comparison-range");
    range.setAttribute("aria-describedby", "comparison-help");
    const controls = document.createElement("div");
    controls.className = "comparison-actions";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", range.getAttribute("aria-label") + " 보기 방식");
    [["치료 전", 100], ["함께 비교", 50], ["치료 후", 0]].forEach(([label, value]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.value = value;
      button.addEventListener("click", () => {
        range.value = value;
        range.dispatchEvent(new Event("input", { bubbles: true }));
      });
      controls.append(button);
    });
    const sync = () => [...controls.children].forEach((button) => button.setAttribute("aria-pressed", String(Number(range.value) === Number(button.dataset.value))));
    range.addEventListener("input", sync);
    box.append(controls);
    sync();
  });
  const spaceStage = document.createElement("div");
  spaceStage.className = "space-stage";
  spaceStage.classList.toggle("tour-video", config.spaceVideoFit === "contain");
  const spaceWindow = document.createElement("div");
  spaceWindow.className = "space-window";
  const artwork = document.createElement("div");
  artwork.className = "space-artwork";
  const copy = centers.querySelector('[data-node-id="986:548"]');
  copy.classList.remove("reveal");
  copy.classList.add("space-copy");
  artwork.append(...centers.childNodes);
  centers.append(spaceStage);
  spaceStage.append(spaceWindow);
  spaceWindow.append(artwork);
  const video = document.createElement("video");
  video.className = "space-video";
  const videoFrame = document.createElement("div");
  videoFrame.className = "space-video-frame";
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-label", config.spaceVideoLabel || "산본중심치과 대기 공간과 진료실 실제 촬영 영상");
  if (config.spacePoster) video.poster = config.spacePoster;
  const veil = document.createElement("div");
  veil.className = "space-veil";
  videoFrame.append(video);
  spaceWindow.append(videoFrame, veil, copy);
  const marker = document.createElement("span");
  marker.className = "space-marker";
  marker.textContent = "산본중심치과의 공간";
  const playback = document.createElement("button");
  playback.type = "button";
  playback.className = "space-play";
  playback.textContent = "영상 재생";
  spaceWindow.append(marker, playback);
  const dock = document.createElement("aside");
  dock.className = "space-dock";
  dock.setAttribute("aria-label", "200평 진료 공간 영상");
  dock.hidden = true;
  const dockLayout = document.createElement("div");
  dockLayout.className = "space-dock-layout";
  const dockPlan = artwork.querySelector(".plan-image img").cloneNode(false);
  dockPlan.className = "space-dock-plan";
  dockPlan.alt = "산본중심치과 진료센터 3D 배치도";
  const dockCopy = document.createElement("div");
  dockCopy.className = "space-dock-copy";
  dockCopy.innerHTML = "<h2><strong>200평</strong> 규모의 진료 공간</h2><p>분야별 전문 진료센터가 한곳에 모여 있습니다.</p>";
  dockLayout.append(dockPlan, dockCopy);
  const dockControls = document.createElement("div");
  dockControls.className = "space-dock-controls";
  const dockReturn = document.createElement("button");
  dockReturn.type = "button";
  dockReturn.textContent = "크게 보기";
  dockReturn.setAttribute("aria-label", "공간 영상 구간으로 돌아가 크게 보기");
  const dockClose = document.createElement("button");
  dockClose.type = "button";
  dockClose.textContent = "영상 닫기";
  dockClose.setAttribute("aria-label", "상단 공간 영상 닫기");
  dockControls.append(dockReturn, dockClose);
  dock.append(dockLayout, dockControls);
  document.body.append(dock);
  let docked = false, dockDismissed = false, spaceVisited = false;
  function movePlayerNode(parent2, node, before = null) {
    if (parent2.moveBefore) parent2.moveBefore(node, before);
    else parent2.insertBefore(node, before);
  }
  function setDocked(next) {
    if (docked === next) return;
    const focused = dock.contains(document.activeElement) || playback === document.activeElement;
    docked = next;
    dock.hidden = !next;
    root.classList.toggle("space-split", next);
    movePlayerNode(next ? dockLayout : videoFrame, video, next ? dockCopy : null);
    movePlayerNode(next ? dockControls : spaceWindow, playback, next ? dockReturn : null);
    spaceStage.classList.toggle("video-docked", next);
    if (focused) {
      const backInScene = centers.getBoundingClientRect().bottom > metrics.splitLine + 1;
      const target = next || backInScene ? playback : document.elementFromPoint(root.clientWidth / 2, metrics.splitLine + 1)?.closest("main > section") || cases;
      if (target !== playback) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
  dockReturn.addEventListener("click", () => {
    window.storyNavigate("centers", { instant: true });
    manualStart = !manualPause;
    playback.focus({ preventScroll: true });
    requestRender();
  });
  dockClose.addEventListener("click", () => {
    dockDismissed = true;
    setDocked(false);
    video.pause();
    requestRender();
  });
  let videoAvailable = false, videoAspect = 0, manualPause = staticStory, manualStart = false, metrics;
  let defaultVideoPending = Boolean(config.spaceVideo), candidatePending = false;
  let previewVisible = true, playPending = false, autoplayBlocked = false, cancelCandidate, activeSection;
  let visualIntro = null, visualSpace = null, lastFrame = null, pendingFrame = 0, renderedY = scrollY;
  const detailDialog = document.getElementById("detail-dialog");
  const responseMs = 64;
  const philosophyStart = 0.35;
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const smooth = (value, start, end) => {
    const t = clamp((value - start) / (end - start));
    return t * t * (3 - 2 * t);
  };
  function follow(current, target, blend) {
    if (current === null || blend === 1) return target;
    const next = current + (target - current) * blend;
    return Math.abs(target - next) < 5e-5 ? target : next;
  }
  function notifyVideo(status, url, retained = false) {
    if (parent !== window) parent.postMessage({ type: "preview-space-status", status, url, retained }, "*");
  }
  function playVideo(userInitiated = false) {
    if (playPending || !userInitiated && autoplayBlocked) return;
    playPending = true;
    if (userInitiated) autoplayBlocked = false;
    video.play().catch((error) => {
      if (error.name !== "AbortError") {
        autoplayBlocked = true;
        playback.textContent = "영상 재생";
      }
    }).finally(() => {
      playPending = false;
      requestRender();
    });
  }
  const styleCache = new WeakMap();
  const css = (element, values) => {
    let previous = styleCache.get(element);
    if (!previous) {
      previous = {};
      styleCache.set(element, previous);
    }
    Object.entries(values).forEach(([key, value]) => {
      if (previous[key] === value) return;
      element.style.setProperty("--" + key, value);
      previous[key] = value;
    });
  };
  function hidden(element, hide) {
    if (element.inert !== hide) element.inert = hide;
    if (element.getAttribute("aria-hidden") !== String(hide)) element.setAttribute("aria-hidden", String(hide));
  }
  function measure(preservePosition = false) {
    const scale = pageScale.getBoundingClientRect().width / 1920;
    if (!scale || innerHeight < 1) return;
    let anchor;
    if (preservePosition && metrics && renderedY >= metrics.intro.top - 1) {
      const readingY = renderedY + (docked ? metrics.splitLine : 0);
      const key = ["intro", "doctors", "space", "cases", "reviews", "information"].filter((key2) => metrics[key2].top <= readingY).at(-1) || "intro";
      anchor = { key, ratio: clamp((readingY - metrics[key].top) / metrics[key].height) };
      if (!staticStory && renderedY + 80 * metrics.scale >= metrics.doctorTimeline.top && renderedY < metrics.doctorTimeline.top + metrics.doctorTimeline.height - metrics.viewport) {
        anchor = { key: "doctorTimeline", ratio: (renderedY + 80 * metrics.scale - metrics.doctorTimeline.top) / metrics.doctorScrollUnit };
      }
    }
    const height = innerHeight / scale;
    const headerHeight = parseFloat(getComputedStyle(header).height);
    css(root, {
      "story-height": height + "px",
      "intro-distance": 3.8 * (1 - philosophyStart) * height + "px",
      "space-fit": Math.max(0.35, Math.min(1, (height - 240) / 830)),
      "space-header-height": headerHeight + "px",
      "space-pane-third": (innerHeight - headerHeight) / 3 + "px"
    });
    const splitLine = headerHeight + parseFloat(getComputedStyle(dock).height);
    css(root, { "space-split-line": splitLine + "px" });
    root.classList.toggle("story-short", height < 870);
    root.classList.toggle("story-compact", height < 720);
    if (!staticStory) css(doctorStage, { "doctor-fit": Math.min(1, doctorBody.clientHeight / Math.max(1, doctorGroup.offsetHeight)) });
    const position = (element) => {
      const r = element.getBoundingClientRect();
      return { top: scrollY + r.top, height: r.height };
    };
    const stageRect = spaceStage.getBoundingClientRect(), frameRect = videoFrame.getBoundingClientRect();
    metrics = {
      scale,
      headerHeight,
      splitLine,
      intro: position(intro),
      doctors: position(doctors),
      space: position(centers),
      cases: position(cases),
      viewport: innerHeight,
      stageHeight: stageRect.height,
      videoFrame: { width: frameRect.width / scale, height: frameRect.height / scale, top: (frameRect.top - stageRect.top) / scale },
      doctorTimeline: position(staticStory ? doctors : doctorTimeline),
      philosophy: position(philosophy),
      questions: position(questions),
      reviews: position(document.querySelector("#reviews")),
      information: position(document.querySelector("#information"))
    };
    metrics.doctorScrollUnit = Math.max(1, metrics.doctorTimeline.height - metrics.viewport) / 2.8;
    if (anchor) scrollTo({ top: anchor.key === "doctorTimeline" ? metrics.doctorTimeline.top - 80 * metrics.scale + anchor.ratio * metrics.doctorScrollUnit : metrics[anchor.key].top + anchor.ratio * metrics[anchor.key].height - (docked ? splitLine : 0), behavior: "instant" });
    cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
    render(performance.now(), true);
  }
  function renderIntro(p) {
    const philoIn = smooth(p, 0.25, 0.35), philoOut = smooth(p, 0.49, 0.6), questionIn = smooth(p, 0.625, 0.71);
    css(stage, {
      "philosophy-alpha": philoIn * (1 - philoOut),
      "philosophy-y": 54 * (1 - philoIn) - 44 * philoOut + "px",
      "questions-alpha": questionIn,
      "questions-y": 38 * (1 - questionIn) + "px"
    });
    hidden(philosophy, !staticStory && philoIn * (1 - philoOut) < 0.05);
    hidden(questions, !staticStory && questionIn < 0.05);
    cards.forEach((card, i) => {
      const revealStart = 0.68 + i * 0.08;
      const alpha = smooth(p, revealStart, revealStart + 0.03);
      css(card, { "card-alpha": alpha, "card-y": 62 * (1 - alpha) + "px" });
      hidden(card, !staticStory && alpha < 0.05);
    });
  }
  function renderDoctors(y, blend) {
    const distance = (y + 80 * metrics.scale - metrics.doctorTimeline.top) / metrics.doctorScrollUnit;
    let settling = false;
    doctorCards.forEach((card, i) => {
      const target = clamp((distance - doctorCardStart(i)) / doctorRevealLength);
      const current = follow(doctorProgress[i], target, blend);
      if (current !== target) settling = true;
      if (current === doctorProgress[i]) return;
      doctorProgress[i] = current;
      const alpha = smooth(current, 0, 1);
      css(card, { "doctor-alpha": alpha, "doctor-y": -36 * (1 - alpha) + "px" });
      hidden(card, alpha < 0.05);
    });
    return settling;
  }
  function fitTourVideo(inset, stageTop) {
    if (!spaceStage.classList.contains("tour-video") || !videoAspect) return;
    const frame = metrics.videoFrame;
    const headerOverlap = staticStory ? 0 : (metrics.headerHeight - stageTop) / metrics.scale;
    const topTrim = Math.min(frame.height, Math.max(0, Math.max(headerOverlap, inset) - frame.top));
    const baseWidth = Math.min(frame.width, frame.height * videoAspect);
    const fitWidth = Math.max(0, Math.min(frame.width - 2 * inset, (frame.height - topTrim - inset) * videoAspect));
    css(video, { "tour-scale": baseWidth ? fitWidth / baseWidth : 0, "tour-y": (topTrim - inset) / 2 + "px" });
  }
  function render(time, sync = false) {
    if (!metrics) return;
    const y = scrollY, viewport = metrics.viewport;
    const progress = (metric) => clamp((y - metric.top) / Math.max(1, metric.height - viewport));
    const onScreen = (metric) => y + viewport > metric.top && y < metric.top + metric.height;
    const scrollingBack = y < renderedY;
    renderedY = y;
    const spaceTop = metrics.space.top - y, spaceBottom = spaceTop + metrics.space.height;
    if (defaultVideoPending && !candidatePending && previewVisible && spaceTop <= viewport * 2 && spaceBottom > 0) {
      defaultVideoPending = false;
      setVideo(config.spaceVideo);
    }
    const elapsed = Math.max(0, time - (lastFrame ?? time));
    const blend = sync || staticStory ? 1 : -Math.expm1(-elapsed / responseMs);
    const targetIntro = philosophyStart + (1 - philosophyStart) * progress(metrics.intro), targetSpace = progress(metrics.space);
    const p = follow(visualIntro, targetIntro, onScreen(metrics.intro) ? blend : 1);
    if (p !== visualIntro) {
      renderIntro(p);
      visualIntro = p;
    }
    const doctorsSettling = !staticStory && renderDoctors(y, onScreen(metrics.doctorTimeline) ? blend : 1);
    const q = visualSpace = follow(visualSpace, targetSpace, onScreen(metrics.space) ? blend : 1);
    const opening = staticStory ? 1 : smooth(q, 0, 0.18), inset = 100 * (1 - opening), textAlpha = smooth(q, 0.51, 0.65);
    const videoAlpha = videoAvailable ? staticStory || config.spaceVideoFromStart ? 1 : smooth(q, 0.25, 0.39) : 0;
    const stageTop = Math.min(Math.max(0, spaceTop), spaceBottom - metrics.stageHeight);
    fitTourVideo(inset, stageTop);
    css(spaceStage, {
      "space-inset": inset + "px",
      "space-radius": 44 * (1 - opening) + "px",
      "space-text-alpha": textAlpha,
      "space-text-y": 65 * (1 - textAlpha) + "px",
      "space-scale": 1.035 + 0.04 * smooth(q, 0.08, 0.8),
      "space-video-alpha": videoAlpha,
      "space-plan-alpha": 1 - videoAlpha
    });
    hidden(copy, !staticStory && textAlpha < 0.05);
    const artInert = videoAlpha > 0.05 || textAlpha > 0.05 || staticStory;
    if (artwork.inert !== artInert) artwork.inert = artInert;
    const artworkHidden = String(videoAlpha > 0.95);
    if (artwork.getAttribute("aria-hidden") !== artworkHidden) artwork.setAttribute("aria-hidden", artworkHidden);
    const visible = y + metrics.viewport > metrics.space.top && spaceBottom > metrics.headerHeight + 1;
    if (visible && y >= metrics.space.top - metrics.headerHeight) spaceVisited = true;
    const afterSpace = spaceBottom <= metrics.splitLine + 1;
    if (!afterSpace && scrollingBack) dockDismissed = false;
    setDocked(spaceVisited && videoAvailable && afterSpace && !dockDismissed);
    hidden(playback, !docked && videoAlpha < 0.5);
    const markerText = videoAlpha > 0.5 ? config.spaceVideoMarker || "02 / 실제 진료 공간" : "01 / 공간의 구성";
    if (marker.textContent !== markerText) marker.textContent = markerText;
    const spaceOnScreen = y >= metrics.space.top && y < metrics.space.top + metrics.space.height - 90;
    const lightIntro = staticStory ? y >= metrics.philosophy.top - 80 : p > 0.265;
    const overSpecialties = y < metrics.intro.top - metrics.headerHeight;
    if (!overSpecialties && menuToggle.getAttribute("aria-expanded") === "true") setMenu(false);
    header.classList.toggle("over-specialties", overSpecialties);
    header.classList.toggle("is-light", !overSpecialties && !docked && lightIntro && !(spaceOnScreen && (videoAlpha > 0.5 || textAlpha > 0.5)));
    if (!visible && !docked) manualStart = false;
    const playbackReady = docked || staticStory || q >= 0.24 || manualStart;
    const playerVisible = docked || visible && (!afterSpace || !dockDismissed);
    if (videoAvailable && videoAlpha > 0.05 && playerVisible && playbackReady && !manualPause && previewVisible && !detailDialog?.open && document.visibilityState === "visible") {
      if (video.paused) playVideo();
    } else if (!video.paused) video.pause();
    const readingTop = docked ? metrics.splitLine : 0;
    const probe = y + readingTop + (metrics.viewport - readingTop) * 0.3;
    const currentSection = probe >= metrics.information.top ? "information" : probe >= metrics.reviews.top ? "reviews" : probe >= metrics.cases.top ? "cases" : probe >= metrics.space.top ? "centers" : probe >= metrics.doctors.top ? "doctors" : probe < metrics.intro.top ? "top" : staticStory ? probe >= metrics.questions.top ? "questions" : probe >= metrics.philosophy.top ? "philosophy" : "top" : p >= 0.625 ? "questions" : p >= 0.25 ? "philosophy" : "top";
    if (activeSection !== currentSection) {
      activeSection = currentSection;
      if (parent !== window) parent.postMessage({ type: "preview-active-section", id: currentSection }, "*");
    }
    if (doctorsSettling || p !== targetIntro || q !== targetSpace) {
      lastFrame = time;
      requestRender();
    } else lastFrame = null;
  }
  function requestRender() {
    if (pendingFrame) return;
    lastFrame ??= performance.now();
    pendingFrame = requestAnimationFrame((time) => {
      pendingFrame = 0;
      render(time);
    });
  }
  function setVideo(url) {
    if (typeof url !== "string" || !/^(assets\/|blob:|https:\/\/)/.test(url)) return;
    cancelCandidate?.();
    candidatePending = true;
    const candidate = document.createElement("video");
    candidate.muted = true;
    candidate.playsInline = true;
    candidate.preload = "auto";
    let finished = false;
    const release = () => {
      candidatePending = false;
      clearTimeout(timeout);
      candidate.removeAttribute("src");
      candidate.load();
    };
    const finish = (success) => {
      if (finished) return;
      finished = true;
      if (success) {
        defaultVideoPending = false;
        videoAspect = candidate.videoWidth / candidate.videoHeight;
        video.src = url;
        videoAvailable = true;
        manualPause = staticStory;
        manualStart = false;
        autoplayBlocked = false;
        spaceStage.classList.add("has-video");
        requestRender();
      } else notifyVideo("error", url, videoAvailable);
      release();
      requestRender();
    };
    const timeout = setTimeout(() => finish(false), 2e4);
    cancelCandidate = () => {
      if (!finished) {
        finished = true;
        release();
      }
    };
    candidate.addEventListener("loadeddata", () => finish(candidate.videoWidth > 0), { once: true });
    candidate.addEventListener("error", () => finish(false), { once: true });
    notifyVideo("loading", url, videoAvailable);
    candidate.src = url;
  }
  video.addEventListener("error", () => {
    videoAvailable = false;
    spaceStage.classList.remove("has-video");
    requestRender();
    notifyVideo("error", video.getAttribute("src"));
  });
  video.addEventListener("loadeddata", () => {
    notifyVideo("ready", video.getAttribute("src"));
    requestRender();
  });
  function reportPlayback(playing) {
    playback.textContent = playing ? "영상 일시정지" : "영상 재생";
    if (parent !== window) parent.postMessage({ type: "preview-space-playback", playing }, "*");
  }
  video.addEventListener("play", () => {
    reportPlayback(true);
    requestRender();
  });
  video.addEventListener("pause", () => reportPlayback(false));
  document.addEventListener("detail-visibility-change", () => {
    if (document.querySelector("#detail-dialog[open]")) video.pause();
    requestRender();
  });
  playback.addEventListener("click", () => {
    manualPause = !video.paused;
    manualStart = !manualPause;
    if (manualPause) video.pause();
    else playVideo(true);
  });
  addEventListener("message", (event) => {
    if (event.source !== parent) return;
    if (event.data?.type === "preview-space-video") setVideo(event.data.url);
    if (event.data?.type === "preview-visibility") {
      previewVisible = event.data.visible !== false;
      requestRender();
    }
  });
  let cancelDoctorFocus = () => {
  };
  window.storyNavigate = (id, { instant = false } = {}) => {
    const element = document.getElementById(id);
    if (!element || !["top", "philosophy", "questions", "doctors", "centers", "cases", "reviews", "information"].includes(id)) return false;
    cancelDoctorFocus();
    measure();
    const position = { philosophy: 0.41, questions: 0.96 }[id];
    const titleOffset = id === "information" ? (element.querySelector('[data-node-id="986:263"]')?.offsetTop || 0) * metrics.scale - 12 : 0;
    const lowerSection = ["cases", "reviews", "information"].includes(id);
    if (lowerSection && (!spaceVisited || !videoAvailable)) dockDismissed = true;
    const topInset = lowerSection && !dockDismissed ? metrics.splitLine : metrics.headerHeight;
    const top = id === "top" ? scrollY + hero.getBoundingClientRect().top : !staticStory && position !== void 0 ? metrics.intro.top + (position - philosophyStart) / (1 - philosophyStart) * (metrics.intro.height - metrics.viewport) : scrollY + element.getBoundingClientRect().top + titleOffset - topInset;
    scrollTo({ top: Math.max(0, top), behavior: staticStory || instant ? "instant" : "smooth" });
    if (staticStory || instant) measure();
    return true;
  };
  if (!staticStory) {
    let visitDoctor = function(card) {
      const token = ++keyboardToken, index = doctorCards.indexOf(card);
      const button = card.querySelector("[data-doctor]");
      keyboardCard = card;
      const top = metrics.doctorTimeline.top - 80 * metrics.scale + metrics.doctorScrollUnit * (doctorCardStart(index) + doctorRevealLength);
      scrollTo({ top, behavior: "smooth" });
      const started = performance.now();
      function finish() {
        if (token !== keyboardToken) return;
        if (card.hidden || button.disabled || performance.now() - started > 5e3) {
          cancelDoctorFocus();
          return;
        }
        if (Math.abs(scrollY - top) < 2 && doctorProgress[index] > 0.98 && !card.inert) {
          keyboardCard = null;
          button.focus({ preventScroll: true });
          return;
        }
        requestAnimationFrame(finish);
      }
      requestAnimationFrame(finish);
    };
    const doctorHeading = doctors.querySelector("h2");
    let keyboardCard = null, keyboardToken = 0;
    cancelDoctorFocus = () => {
      keyboardCard = null;
      keyboardToken++;
    };
    const nextAfterDoctors = () => [...document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].find((el) => el.tabIndex >= 0 && !el.disabled && !el.closest("[inert],[hidden]") && el.getClientRects().length && !doctors.contains(el) && doctors.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented) return;
      if (event.key === "Shift") return;
      if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || document.querySelector("#detail-dialog[open]")) {
        cancelDoctorFocus();
        return;
      }
      const available = doctorCards.filter((card) => !card.hidden && !card.querySelector("[data-doctor]").disabled);
      const current = keyboardCard || available.find((card) => card.contains(event.target));
      let target;
      if (event.target === doctorHeading && !current && !event.shiftKey) target = available[0];
      else if (current) {
        const index = available.indexOf(current);
        target = available[index + (event.shiftKey ? -1 : 1)] || (event.shiftKey ? doctorHeading : nextAfterDoctors());
      } else if (event.shiftKey && event.target === nextAfterDoctors()) target = available.at(-1);
      if (!target) return;
      event.preventDefault();
      if (available.includes(target)) visitDoctor(target);
      else {
        cancelDoctorFocus();
        if (target === doctorHeading) {
          doctorHeading.tabIndex = -1;
          doctorHeading.focus({ preventScroll: true });
          window.storyNavigate("doctors");
        } else target.focus();
      }
    });
    for (const type of ["wheel", "touchstart", "pointerdown"]) addEventListener(type, cancelDoctorFocus, { passive: true });
    document.addEventListener("doctor-preview-change", cancelDoctorFocus);
    addEventListener("resize", cancelDoctorFocus);
  }
  addEventListener("scroll", requestRender, { passive: true });
  addEventListener("resize", () => measure(true));
  document.addEventListener("visibilitychange", requestRender);
  document.fonts.ready.then(() => measure(true));
  if (defaultVideoPending) notifyVideo("deferred", config.spaceVideo);
  measure();
})();

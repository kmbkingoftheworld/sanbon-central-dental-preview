(() => {
  "use strict";
  const story = document.getElementById("top");
  if (!story?.classList.contains("specialty-story")) return;
  if (["off", "reduce"].includes(new URLSearchParams(location.search).get("motion"))) return;

  const panel = story.querySelector(".specialty-panel");
  const photo = panel.querySelector(".specialty-photo");
  const irises = [...photo.querySelectorAll(".specialty-iris")];
  const layers = [...panel.querySelectorAll("[data-specialty-step]")];
  const begin = panel.querySelector(".specialty-start");
  const controls = panel.querySelector(".specialty-steps");
  const [previous, next] = controls.querySelectorAll("button");
  const ticks = [...controls.querySelectorAll("i")];
  const count = controls.querySelector(".specialty-count");
  const status = panel.querySelector(".specialty-status");
  const labels = ["시작", "치주과 전문의", "치주과 설명", "상담 사진 왼쪽", "보존과 전문의", "보존과 설명", "상담 사진 오른쪽"];
  const last = labels.length - 1;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const ease = t => t * t * (3 - 2 * t);
  let stride = 1, origin = 0, progress = -1, target = null, frame = 0, announced = -1;
  let geometry = [];

  function draw(force = false) {
    frame = 0;
    const raw = clamp((scrollY - origin) / stride, 0, last);
    const stopAt = Math.round(raw);
    const p = Math.abs(raw - stopAt) * stride <= 1 ? stopAt : raw;
    if (target !== null && Math.abs(p - target) < .002) target = null;
    if (p === progress && !force) return;
    progress = p;
    const fraction = n => clamp(p - n + 1, 0, 1);
    const reveal = n => reduced.matches ? Number(fraction(n) >= .5) : ease(fraction(n));
    for (const layer of layers) {
      const shown = reveal(Number(layer.dataset.specialtyStep));
      layer.style.opacity = shown;
      layer.style.transform = 'translate3d(0,' + (21 * (1 - shown)) + 'px,0)';
      layer.setAttribute("aria-hidden", String(shown === 0));
    }
    panel.style.setProperty("--second-title", reveal(4));
    irises.forEach((iris, i) => {
      const shown = reveal(3 + 3 * i);
      const { x, y, radius } = geometry[i];
      iris.style.visibility = shown ? "visible" : "hidden";
      iris.style.clipPath = shown === 1 ? "none"
        : 'circle(' + (2 + shown * radius).toFixed(2) + 'px at ' + x + 'px ' + y + 'px)';
    });
    photo.setAttribute("aria-hidden", String(p <= 2));
    ticks.forEach((tick, i) => tick.style.setProperty("--filled", fraction(i + 1)));
    begin.hidden = p >= .42;
    begin.style.opacity = 1 - clamp(p / .42, 0, 1);
    const stop = Math.floor(p + .002);
    previous.disabled = p < .002;
    next.setAttribute("aria-label", stop === last ? "다음 내용: 진료 철학" : "다음 단계");
    if (announced !== stop) {
      announced = stop;
      count.textContent = stop + " / " + last;
      status.textContent = stop ? stop + "단계, " + labels[stop] : "";
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(() => draw());
  }
  function layout() {
    const rect = story.getBoundingClientRect();
    const previousOrigin = origin, previousStride = stride;
    origin = scrollY + rect.top;
    stride = Math.max(1, (rect.height - panel.offsetHeight) / last);
    const w = photo.clientWidth, h = photo.clientHeight, half = w / 2;
    const scale = Math.max(w / 4096, h / 2168);
    geometry = [[.348, .50], [.693, .53]].map(([u, v], i) => {
      const x = Math.round(clamp((u - .5) * 4096 * scale + half - i * half, .08 * half, .92 * half));
      const y = Math.round(clamp((v - .5) * 2168 * scale + h / 2, .12 * h, .87 * h));
      return { x, y, radius: Math.hypot(Math.max(x, half - x), Math.max(y, h - y)) };
    });
    if (progress >= 0 && (origin !== previousOrigin || stride !== previousStride)
        && scrollY >= previousOrigin - 1 && scrollY <= previousOrigin + last * previousStride + 1) {
      target = null;
      scrollTo({ top: origin + progress * stride, behavior: "instant" });
    }
    draw(true);
  }
  const pinned = () => scrollY >= origin - 1 && scrollY <= origin + last * stride + 1;
  const current = () => target ?? Math.round(clamp((scrollY - origin) / stride, 0, last));
  const canStep = direction => current() + direction >= 0 && current() + direction <= last;
  function go(stop) {
    target = clamp(stop, 0, last);
    scrollTo({ top: origin + target * stride, behavior: reduced.matches ? "instant" : "smooth" });
    schedule();
  }
  function step(direction) { go(current() + direction); }

  let wheelTime = -Infinity, wheelDirection = 0, wheelTravel = 0, wheelUsed = false;
  window.addEventListener("wheel", event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || !pinned() || !event.deltaY
        || Math.abs(event.deltaX) > Math.abs(event.deltaY)
        || !event.target.closest?.(".specialty-panel, .story-header, .back-top")) return;
    const direction = Math.sign(event.deltaY), now = performance.now();
    if (now - wheelTime > 170 || direction !== wheelDirection) {
      wheelUsed = false;
      wheelTravel = 0;
    }
    wheelTime = now;
    wheelDirection = direction;
    if (!wheelUsed && !canStep(direction)) return;
    event.preventDefault();
    if (wheelUsed) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
    wheelTravel += Math.abs(event.deltaY) * unit;
    if (wheelTravel >= 5) {
      wheelUsed = true;
      step(direction);
    }
  }, { passive: false });

  let touch = null;
  panel.addEventListener("touchstart", event => {
    touch = null;
    if (!pinned() || event.touches.length !== 1) return;
    const point = event.touches[0];
    touch = { x: point.clientX, y: point.clientY, start: scrollY, stop: current(), moved: false, delta: 0 };
  }, { passive: true });
  panel.addEventListener("touchmove", event => {
    if (!touch || event.touches.length !== 1 || !event.cancelable) { touch = null; return; }
    const point = event.touches[0], delta = touch.y - point.clientY;
    if (!touch.moved) {
      if (Math.abs(delta) < 5) return;
      if (Math.abs(delta) < Math.abs(touch.x - point.clientX) || !canStep(Math.sign(delta))) { touch = null; return; }
      touch.moved = true;
    }
    event.preventDefault();
    target = null;
    touch.delta = delta;
    const travel = Math.min(.78 * stride, .38 * panel.clientHeight);
    const offset = clamp((touch.start - origin) / stride + delta / travel, Math.max(0, touch.stop - 1), Math.min(last, touch.stop + 1));
    scrollTo({ top: origin + stride * offset, behavior: "instant" });
    draw();
  }, { passive: false });
  function releaseTouch(event) {
    if (touch?.moved) {
      const advance = event.type !== "touchcancel" && Math.abs(touch.delta) > clamp(panel.clientHeight * .07, 25, 60);
      go(touch.stop + (advance ? Math.sign(touch.delta) : 0));
    }
    touch = null;
  }
  panel.addEventListener("touchend", releaseTouch);
  panel.addEventListener("touchcancel", releaseTouch);
  document.addEventListener("keydown", event => {
    if (!pinned() || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey
        || event.target.closest?.("input, select, textarea, [contenteditable=true], dialog")
        || (event.key === " " && event.target.closest?.("button, a"))
        || document.querySelector(".entry-iris, dialog[open]")) return;
    const direction = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1, " ": event.shiftKey ? -1 : 1 }[event.key];
    if (!direction || !canStep(direction)) return;
    event.preventDefault();
    if (!event.repeat) step(direction);
  });
  begin.addEventListener("click", () => { next.focus({ preventScroll: true }); go(1); });
  previous.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => {
    if (current() < last) step(1);
    else navigateSection("philosophy", { focus: true, instant: reduced.matches });
  });
  story.classList.add("is-sequenced");
  controls.hidden = false;
  layout();
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", layout);
  new ResizeObserver(layout).observe(panel);
  reduced.addEventListener("change", () => draw(true));
})();

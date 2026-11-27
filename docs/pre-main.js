(() => {
  const banner = document.querySelector('.pre-main');
  if (!banner) return;
  const mode = new URLSearchParams(location.search).get('motion');

  // Section links and the original layout comparison open at their own destination.
  if (location.hash || mode === 'off') {
    banner.remove();
    return;
  }

  const hero = document.getElementById('top');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const prefersStill = () => mode === 'reduce';
  const modified = event => event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
  const downWheel = event => !modified(event) && event.deltaY > Math.abs(event.deltaX);
  let cover = null, phase = null, skipRest = false;
  let zooms = [];

  // Opening film. A sharp photograph lies over the paused first frame of the same
  // footage. The first scroll (or 5 s of waiting) starts the film and the photograph
  // dissolves into it. The film must then run to its end; scrolling only speeds it
  // up for a moment. The small "skip" button is the one way to leave early.
  const film = banner.querySelector('video');
  const skip = banner.querySelector('.intro-skip');
  const TITLE_MS = 1300, AUTO_MS = 5000;
  const BOOST_RATE = 2.5, BOOST_HOLD_MS = 450, BOOST_AFTER_MS = 600;
  let filmState = film ? 'still' : 'none', filmStarted = 0, autoTimer, titleTimer, boostTimer;
  const filming = () => !prefersStill() && (filmState === 'still' || filmState === 'playing');

  function startFilm() {
    if (filmState !== 'still') return;
    filmState = 'playing';
    filmStarted = performance.now();
    clearTimeout(autoTimer);
    clearTimeout(titleTimer);
    // An early scroll still gets to read the title before it leaves.
    const titleShown = banner.classList.contains('title-in');
    banner.classList.add('title-in');
    titleTimer = setTimeout(() => banner.classList.add('title-out'), titleShown ? 1500 : 2900);
    // Render the button once at opacity 0 so its delayed fade-in always runs.
    if (skip) { skip.hidden = false; void skip.offsetWidth; }
    const run = film.play();
    if (run) run.catch(() => { filmState = 'none'; enterMain({}); });
  }
  function boost() {
    if (filmState !== 'playing' || performance.now() - filmStarted < BOOST_AFTER_MS) return;
    film.playbackRate = BOOST_RATE;
    clearTimeout(boostTimer);
    boostTimer = setTimeout(() => { film.playbackRate = 1; }, BOOST_HOLD_MS);
  }
  function stopFilm() {
    clearTimeout(autoTimer);
    clearTimeout(titleTimer);
    clearTimeout(boostTimer);
    if (film) film.playbackRate = 1;
    if (filmState !== 'none') filmState = 'done';
  }
  // Coming back up to the banner shows the photograph and title again.
  function resetFilm() {
    if (!film) return;
    film.pause();
    try { film.currentTime = 0; } catch (error) { /* not seekable yet */ }
    banner.classList.remove('film-playing', 'title-out');
    banner.classList.add('title-in');
    if (skip) skip.hidden = true;
  }
  function advance(options) {
    if (filmState === 'still' && !prefersStill()) { startFilm(); return; }
    if (filmState === 'playing') { boost(); return; }
    enterMain(options);
  }
  if (film) {
    film.muted = true;
    film.addEventListener('playing', () => { if (filmState === 'playing') banner.classList.add('film-playing'); });
    film.addEventListener('ended', () => { if (filmState === 'playing') enterMain({}); });
    film.addEventListener('error', () => {
      const wasPlaying = filmState === 'playing';
      if (filmState === 'still' || wasPlaying) filmState = 'none';
      clearTimeout(autoTimer);
      if (wasPlaying) enterMain({});
    });
    skip?.addEventListener('click', () => enterMain({ focus: true }));
    titleTimer = setTimeout(() => banner.classList.add('title-in'), TITLE_MS);
    if (!prefersStill()) autoTimer = setTimeout(startFilm, AUTO_MS);
  }

  // The opaque ring and its contents share the viewport center. Only change the
  // real scroll position when the aperture is closed, including the sticky menu.
  async function enterMain(options = {}) {
    if (cover) return;
    stopFilm();
    const arrive = () => {
      if (typeof navigateSection === 'function') navigateSection('top', { ...options, instant: true });
      else document.querySelector('.page-scale').scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    if (prefersStill() || !hero || !banner.animate) { arrive(); return; }

    cover = document.createElement('div');
    cover.className = 'entry-iris';
    cover.setAttribute('aria-hidden', 'true');
    const disc = document.createElement('div');
    cover.append(disc);
    document.body.append(cover);
    document.documentElement.classList.add('entering-main');
    skipRest = false;
    const radius = Math.ceil(Math.hypot(cover.clientWidth, cover.clientHeight) / 2) + 2;
    disc.style.width = disc.style.height = radius * 2 + 'px';
    const aperture = [
      { borderWidth: '0px', backgroundColor: 'rgba(16,21,29,0)' },
      { offset: .78, borderWidth: radius * .78 + 'px', backgroundColor: 'rgba(16,21,29,.12)' },
      { borderWidth: radius + 'px', backgroundColor: '#10151d' }
    ];
    const picture = [
      { transform: 'scale(1)', opacity: 1 },
      { offset: .55, transform: 'scale(.78)', opacity: .9 },
      { transform: 'scale(.025)', opacity: 0 }
    ];
    async function play(scene, opening) {
      if (skipRest) return;
      const timing = {
        duration: opening ? 610 : 420, direction: opening ? 'reverse' : 'normal',
        easing: 'cubic-bezier(.38,0,.73,.78)', fill: 'both'
      };
      zooms = [scene.animate(picture, timing)];
      const menu = opening && document.querySelector('.story-header');
      if (menu) zooms.push(menu.animate(picture, timing));
      phase = disc.animate(aperture, timing);
      try { await phase.finished; }
      finally {
        zooms.forEach(zoom => zoom.cancel());
        zooms = [];
        phase.cancel();
        phase = null;
      }
    }
    cover.addEventListener('wheel', event => {
      if (downWheel(event)) holdWheel(event);
      else if (!modified(event)) event.preventDefault();
    }, { passive: false });
    let arrived = false;
    try {
      await play(banner, false);
      arrive();
      arrived = true;
      resetFilm();
      // Include the backing artwork that shows through the hero photograph.
      await play(hero.closest('.intro-stage') || hero, true);
    } finally {
      cover.remove();
      cover = null;
      document.documentElement.classList.remove('entering-main');
      if (!arrived) { arrive(); resetFilm(); }
    }
  }

  function finishEntry() {
    skipRest = true;
    zooms.forEach(zoom => zoom.finish());
    phase?.finish();
  }
  window.addEventListener('resize', finishEntry);
  window.addEventListener('pagehide', finishEntry);
  reduced.addEventListener('change', finishEntry);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishEntry(); });

  // A trackpad can keep sending wheel events after the pointer is over the main page.
  // Consume only the tail of the gesture that advanced the opening banner.
  let wheelEnd;
  function releaseWheel() {
    clearTimeout(wheelEnd);
    window.removeEventListener('wheel', finishWheelGesture, true);
  }
  function finishWheelGesture(event) {
    if (!downWheel(event)) { releaseWheel(); return; }
    event.preventDefault();
    clearTimeout(wheelEnd);
    wheelEnd = setTimeout(releaseWheel, 160);
  }
  function holdWheel(event) {
    finishWheelGesture(event);
    window.addEventListener('wheel', finishWheelGesture, { capture: true, passive: false });
  }
  banner.addEventListener('wheel', event => {
    if (event.defaultPrevented || !downWheel(event)) return;
    // While the film is waiting or running, the wheel never moves the page.
    if (filming()) { event.preventDefault(); advance(); return; }
    holdWheel(event);
    enterMain();
  }, { passive: false });

  banner.querySelector('.scroll-guide-link').addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || modified(event)) return;
    event.preventDefault();
    advance({ focus: true, remember: true });
  });
  window.addEventListener('keydown', event => {
    if (event.defaultPrevented || modified(event)) return;
    if (cover) {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) event.preventDefault();
      return;
    }
    if (!['ArrowDown', 'PageDown', ' '].includes(event.key) || banner.getBoundingClientRect().bottom <= 1) return;
    // The skip button keeps its own Space/Enter behaviour.
    if (event.target.closest?.('.intro-skip')) return;
    // Browser Back can restore the banner while focus is still on the main heading.
    if (!banner.contains(event.target) && event.target.closest?.('a,button,input,select,textarea,[contenteditable]')) return;
    event.preventDefault();
    advance({ focus: true });
  });

  // Recognize a single vertical swipe on the cover; preserve horizontal gestures and pinch zoom.
  let touchStart;
  banner.classList.add('has-scroll-entry');
  banner.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  banner.addEventListener('touchcancel', () => { touchStart = null; });
  // Dragging upward during the film keeps it fast for as long as the finger moves.
  banner.addEventListener('touchmove', event => {
    if (!touchStart || filmState !== 'playing' || event.touches.length !== 1) return;
    if (touchStart.clientY - event.touches[0].clientY > 12) boost();
  }, { passive: true });
  banner.addEventListener('touchend', event => {
    const start = touchStart;
    touchStart = null;
    if (!start || event.touches.length) return;
    const end = event.changedTouches[0];
    const dy = start.clientY - end.clientY;
    if (Math.abs(dy) < 30 || Math.abs(dy) <= Math.abs(start.clientX - end.clientX)) return;
    if (dy > 0) advance();
    else if (banner.getBoundingClientRect().top < 0)
      banner.scrollIntoView({ block: 'start', behavior: prefersStill() ? 'instant' : 'smooth' });
  }, { passive: true });
})();

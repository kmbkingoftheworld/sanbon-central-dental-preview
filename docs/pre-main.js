(() => {
 'use strict';
 // Section links and the Figma layout comparison should open their destination directly.
 const motionMode = new URLSearchParams(location.search).get('motion');
 if (location.hash || motionMode === 'off') return;
 const root = document.documentElement, splash = document.createElement('dialog');
 const reduce = motionMode === 'reduce';
 splash.className = 'pre-main'; splash.setAttribute('aria-label', '산본중심치과 시작 화면');
 splash.innerHTML = '<img src="assets/clinic/pre-main-clinic.webp" width="2560" height="1227" alt="" decoding="async"><div class="pre-main-caption"><h2>수술 경력 15년의 수술 전문 치과의사<br>대학병원 교수 출신, 치주과 전문의<br>대표원장이 직접 집도</h2><p>친절하고 전문적인 진단<br>안전하고 튼튼한 임플란트<br>고난이도 뼈이식 재수술<br>대형 치과의 믿을 수 있는 AS</p></div><p class="pre-main-note">잠시 후 메인 페이지로 이동합니다</p><button class="pre-main-enter" type="button">메인 바로 보기 →</button>';
 document.body.append(splash);
 let timer, completed = false, resolveClosed;
 const closed = new Promise(resolve => { resolveClosed = resolve; });
 const finish = () => {
  if (completed) return;
  completed = true; clearTimeout(timer); clearTimeout(fallback);
  splash.classList.add('is-leaving');
  const close = () => {
   if (!splash.isConnected) return;
   splash.close(); splash.remove(); root.classList.remove('pre-main-open');
   dispatchEvent(new Event('resize')); resolveClosed();
  };
  if (reduce) close(); else {
   splash.addEventListener('transitionend', event => { if (event.target === splash && event.propertyName === 'opacity') close(); }, { once: true });
   setTimeout(() => { if (splash.isConnected) close(); }, 380);
  }
 };
 // Explicit section selection can end the introduction using the same short fade.
 // All callers wait for one close, including a second selection during the fade.
 window.dismissPreMain = () => { finish(); return closed; };
 splash.querySelector('button').addEventListener('click', finish);
 splash.addEventListener('cancel', event => { event.preventDefault(); finish(); });
 root.classList.add('pre-main-open'); splash.showModal();
 // Count two seconds from the decoded photo, not from the start of its download.
 const fallback = setTimeout(finish, 10000);
 splash.querySelector('img').decode().then(() => {
  if (!completed) { clearTimeout(fallback); splash.classList.add('is-ready'); timer = setTimeout(finish, 2000); }
 }).catch(finish);
})();

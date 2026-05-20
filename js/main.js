/* ============================================================
   NAVBAR — scroll + mobile toggle
   ============================================================ */
const navbar    = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

function closeNav() {
  navLinks.classList.remove('open');
  navbar.classList.remove('menu-open');
  navToggle.setAttribute('aria-expanded', 'false');
}
function openNav() {
  navLinks.classList.add('open');
  navbar.classList.add('menu-open');
  navToggle.setAttribute('aria-expanded', 'true');
}

navToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  navLinks.classList.contains('open') ? closeNav() : openNav();
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// 메뉴 바깥 탭하면 자동으로 닫힘
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') && !navbar.contains(e.target)) {
    closeNav();
  }
});

/* ============================================================
   COUNTDOWN TIMER
   행사 날짜/시간을 수정하려면 EVENT_DATE를 바꾸세요.
   ============================================================ */
const EVENT_DATE = new Date('2026-06-13T14:00:00');

const elDays    = document.getElementById('cd-days');
const elHours   = document.getElementById('cd-hours');
const elMinutes = document.getElementById('cd-minutes');
const elSeconds = document.getElementById('cd-seconds');

function pad(n) { return String(n).padStart(2, '0'); }

let prevSec = -1;

function updateCountdown() {
  const diff = EVENT_DATE - new Date();

  if (diff <= 0) {
    document.getElementById('countdown-grid').classList.add('hidden');
    document.getElementById('countdown-done').classList.remove('hidden');
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);

  elDays.textContent    = pad(days);
  elHours.textContent   = pad(hours);
  elMinutes.textContent = pad(minutes);

  if (seconds !== prevSec) {
    elSeconds.textContent = pad(seconds);
    /* tick 애니메이션 재시작 */
    elSeconds.style.animation = 'none';
    elSeconds.offsetHeight; // reflow
    elSeconds.style.animation = '';
    prevSec = seconds;
  }
}

updateCountdown();
setInterval(updateCountdown, 500);

/* ============================================================
   FADE-IN — Intersection Observer
   ============================================================ */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.1 }
);
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ============================================================
   GLIGHTBOX — 갤러리 라이트박스
   ============================================================ */
if (typeof GLightbox !== 'undefined') {
  GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true });
}

/* ============================================================
   ADD TO CALENDAR — .ics 파일 다운로드
   모바일에서는 기본 캘린더 앱이 자동으로 열림
   ============================================================ */
function addToCalendar() {
  const ua = navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);

  // ─── Android: Google 캘린더 Universal Link → 앱 자동 실행
  if (isAndroid) {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: '인천국제고 국제반 3기 6월 동창회',
      dates: '20260613T030000Z/20260614T030000Z',
      details:
        '🎉 1박 2일 동창회\n' +
        '🍖 6/13 (토) 18:00 — 바비큐 파티 @ 씨앤에스테크\n' +
        '주소: 충청남도 천안시 서북구 직산 181-18\n\n' +
        '📞 동창회장 최주헌: 010-7179-0890',
      location: '충청남도 천안시 서북구 천안대로 1446 직산역서희스타힐스'
    });
    window.location.href = 'https://calendar.google.com/calendar/render?' + params.toString();
    return;
  }

  // ─── iOS / 데스크톱: 정적 .ics 파일로 이동
  // GitHub Pages가 text/calendar MIME으로 서빙 → iOS Safari가 '캘린더에 추가' 시트 표시
  window.location.href = 'event.ics';
}

document.getElementById('btn-calendar').addEventListener('click', addToCalendar);

/* ============================================================
   CONFETTI — RSVP 성공 시 발사 🎊
   ============================================================ */
function launchConfetti() {
  const colors = ['#f5e642', '#f78fb3', '#7ec8f5', '#7eeaaa', '#ff6b6b', '#a78bfa'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = Math.random() * 9 + 6;
    el.style.cssText = [
      `left:${Math.random() * 100}vw`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${colors[Math.floor(Math.random() * colors.length)]}`,
      `animation-duration:${Math.random() * 2 + 2.5}s`,
      `animation-delay:${Math.random() * 0.6}s`,
      `transform:rotate(${Math.random() * 360}deg)`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

/* ============================================================
   RSVP FORM — Formspree Ajax
   index.html의 action="https://formspree.io/f/YOUR_FORM_ID" 에서
   YOUR_FORM_ID 를 실제 Formspree Form ID로 교체하세요.
   ============================================================ */
const rsvpForm   = document.getElementById('rsvp-form');
const btnText    = rsvpForm.querySelector('.btn-text');
const btnLoading = rsvpForm.querySelector('.btn-loading');
const successMsg = document.getElementById('rsvp-success');
const errorMsg   = document.getElementById('rsvp-error');

/* 히든 미션 — '참석' 응답자에게 25% 확률로 당첨 */
const MISSION_PROBABILITY = 0.25;
const missionField = document.getElementById('mission-field');
const missionModal = document.getElementById('mission-modal');

function showMissionModal() {
  missionModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function hideMissionModal() {
  missionModal.classList.add('hidden');
  document.body.style.overflow = '';
}
missionModal.querySelector('.mission-close').addEventListener('click', hideMissionModal);
missionModal.querySelector('.mission-ok').addEventListener('click', hideMissionModal);
missionModal.addEventListener('click', (e) => {
  if (e.target === missionModal) hideMissionModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !missionModal.classList.contains('hidden')) hideMissionModal();
});

/* 테스트 모드 — URL에 ?test-mission=1 추가하면 팝업 미리보기
   예: https://juhunc.github.io/IIHS/?test-mission=1 */
if (new URLSearchParams(window.location.search).get('test-mission') === '1') {
  setTimeout(showMissionModal, 600);
}

rsvpForm.addEventListener('submit', async e => {
  e.preventDefault();

  // 히든 미션 추첨: 참석 응답 + 25% 확률
  const attendance = rsvpForm.querySelector('input[name="attendance"]:checked')?.value;
  const roll = Math.random();
  const isMissionWinner = attendance === '참석' && roll < MISSION_PROBABILITY;
  missionField.value = isMissionWinner ? '당첨' : '';

  // 디버그 로그 (브라우저 개발자 도구 Console에서 확인 가능)
  console.log('🎲 미션 추첨:', {
    출석: attendance || '(미선택)',
    굴림: roll.toFixed(3),
    임계값: MISSION_PROBABILITY,
    당첨: isMissionWinner ? '✅ 축하해!' : '❌ 다음 기회에',
  });

  btnText.classList.add('hidden');
  btnLoading.classList.remove('hidden');
  successMsg.classList.add('hidden');
  errorMsg.classList.add('hidden');

  try {
    const res = await fetch(rsvpForm.action, {
      method: 'POST',
      body: new FormData(rsvpForm),
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      rsvpForm.reset();
      successMsg.classList.remove('hidden');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      launchConfetti();

      // 당첨자에게 컨페티 직후 미션 팝업 표시
      if (isMissionWinner) {
        setTimeout(showMissionModal, 1200);
      }
    } else {
      throw new Error();
    }
  } catch {
    errorMsg.classList.remove('hidden');
  } finally {
    btnText.classList.remove('hidden');
    btnLoading.classList.add('hidden');
  }
});

/* ============================================================
   NAVBAR — scroll + mobile toggle
   ============================================================ */
const navbar    = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
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

rsvpForm.addEventListener('submit', async e => {
  e.preventDefault();

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

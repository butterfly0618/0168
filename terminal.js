/* terminal.js — logica comune a tutti gli enigma */

const STORAGE_KEY = "br_qr_unlocked";

/* ── Orologio ── */
function updateClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}

/* ── Init DOM-dependent on load ── */
document.addEventListener('DOMContentLoaded', () => {
  setInterval(updateClock, 1000);
  updateClock();

  const node = document.getElementById('node');
  if (node) node.textContent = 'NODE: ' + Math.random().toString(16).slice(2, 8).toUpperCase();

  const ans = document.getElementById('ans');
  if (ans) ans.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });

  /* ── Degradazione progressiva (20 step) ── */
  _buildDegradeSteps();
});

/* ── Title flicker ── */
(function() {
  const original = document.title;
  const alts = ['[REDACTED]', '???', '_ _ _', 'TERMINAL_B.R.'];
  setInterval(() => {
    if (Math.random() < 0.15) {
      document.title = alts[Math.floor(Math.random() * (alts.length - 1))];
      setTimeout(() => { document.title = original; }, 800 + Math.random() * 1200);
    }
  }, 8000);
})();

/* ── Warning overlay (appare dopo 10 tentativi sbagliati) ── */
let _failCount = 0;

let _degradeSteps = [];

function _buildDegradeSteps() {
  _degradeSteps = [
    // fase 1 (1-5)
    () => document.body.style.setProperty('--flicker-speed', '0.12s'),
    () => { document.body.style.filter = 'brightness(0.88)'; },
    () => { const o = document.querySelector('.crt-overlay'); if(o) o.style.opacity = '1.2'; },
    () => { document.body.style.filter = 'brightness(0.85) contrast(1.05)'; },
    () => { const s = document.querySelector('.scan-flash'); if(s) s.style.animationDuration = '6s'; },
    // fase 2 (6-10)
    () => { const w = document.querySelector('.wrap'); if(w) w.style.animation = 'subtleShake 4s infinite'; },
    () => { document.body.style.filter = 'brightness(0.82) contrast(1.1) saturate(0.9)'; },
    () => { const s = document.querySelector('.scan-flash'); if(s) s.style.animationDuration = '3s'; },
    () => { const w = document.querySelector('.wrap'); if(w) w.style.animation = 'subtleShake 2s infinite'; },
    () => { document.body.style.filter = 'brightness(0.78) contrast(1.15) saturate(0.8) hue-rotate(5deg)'; },
    // fase 3 (11-15)
    () => { const w = document.querySelector('.wrap'); if(w) w.style.animation = 'mediumShake 1.5s infinite'; _startCharGlitch(); },
    () => { document.body.style.filter = 'brightness(0.72) contrast(1.2) saturate(0.6) hue-rotate(10deg)'; },
    () => { const o = document.querySelector('.crt-overlay'); if(o) o.style.background = 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.08), rgba(0,255,0,0.04), rgba(0,0,255,0.08))'; },
    () => { const w = document.querySelector('.wrap'); if(w) w.style.animation = 'mediumShake 0.8s infinite'; },
    () => { document.body.style.filter = 'brightness(0.65) contrast(1.3) saturate(0.3) hue-rotate(20deg)'; },
    // fase 4 (16-20)
    () => { const w = document.querySelector('.wrap'); if(w) w.style.animation = 'heavyShake 0.4s infinite'; _maxGlitch(); },
    () => { document.body.style.filter = 'brightness(0.5) contrast(1.5) saturate(0) hue-rotate(40deg) invert(0.1)'; },
    () => { const o = document.querySelector('.crt-overlay'); if(o) o.style.opacity = '3'; },
    () => { document.body.style.filter = 'brightness(0.3) contrast(2) saturate(0) hue-rotate(60deg) invert(0.2)'; const w = document.querySelector('.wrap'); if(w) w.style.animation = 'heavyShake 0.2s infinite'; },
    () => _showCritical(),
  ];
}

let _charGlitchInterval = null;
let _maxGlitchInterval  = null;

function _startCharGlitch() {
  const chars = '!@#$%^&*<>?/\\|{}[]~`░▒▓█▄▀■□▪▫';
  _charGlitchInterval = setInterval(() => {
    const textNodes = document.querySelector('.wrap');
    if (!textNodes) return;
    const spans = textNodes.querySelectorAll('.char.decoded, .enigma-plain, .boot-msg, .section-label');
    if (!spans.length) return;
    const target = spans[Math.floor(Math.random() * spans.length)];
    const orig = target.textContent;
    if (!orig.trim()) return;
    const pos = Math.floor(Math.random() * orig.length);
    const glitched = orig.substring(0, pos) + chars[Math.floor(Math.random() * chars.length)] + orig.substring(pos + 1);
    target.textContent = glitched;
    setTimeout(() => { target.textContent = orig; }, 80);
  }, 300);
}

function _maxGlitch() {
  const chars = '!@#$%^&*<>?/\\|{}[]~`░▒▓█▄▀■□';
  _maxGlitchInterval = setInterval(() => {
    const wrap = document.querySelector('.wrap');
    if (!wrap) return;
    const all = wrap.querySelectorAll('*');
    for (let i = 0; i < 3; i++) {
      const el = all[Math.floor(Math.random() * all.length)];
      if (!el.children.length && el.textContent.trim()) {
        const orig = el.textContent;
        el.textContent = orig.split('').map(c =>
          Math.random() < 0.3 ? chars[Math.floor(Math.random() * chars.length)] : c
        ).join('');
        setTimeout(() => { el.textContent = orig; }, 60);
      }
    }
  }, 100);
}

function _showCritical() {
  clearInterval(_charGlitchInterval);
  clearInterval(_maxGlitchInterval);

  let overlay = document.getElementById('warning-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'warning-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="warning-inner">
      <div class="warning-icon">⚠︎</div>
      <div class="warning-text">CRITICAL_DAMAGE</div>
      <div class="warning-sub">RELOADING_</div>
    </div>`;
  overlay.classList.remove('warning-hide');
  overlay.classList.add('warning-show');

  setTimeout(() => { window.location.reload(); }, 2500);
}

function showWarning() {
  let overlay = document.getElementById('warning-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'warning-overlay';
    overlay.innerHTML = `
      <div class="warning-inner">
        <div class="warning-icon">⚠︎</div>
        <div class="warning-text">WARNING</div>
        <div class="warning-sub">UNAUTHORIZED_ACCESS_ATTEMPT</div>
      </div>`;
    document.body.appendChild(overlay);
  }
  overlay.classList.remove('warning-hide');
  overlay.classList.add('warning-show');
  setTimeout(() => {
    overlay.classList.remove('warning-show');
    overlay.classList.add('warning-hide');
  }, 2000);
}

function applyDegrade(step) {
  if (step >= 1 && step <= 20) _degradeSteps[step - 1]();
}

/* ── Boot message rotante ── */
function startBootMsgLoop(msgs) {
  setInterval(() => {
    if (Math.random() > 0.8)
      document.getElementById('boot-msg').textContent =
        msgs[Math.floor(Math.random() * msgs.length)];
  }, 3000);
}

/* ── SHA-256 ── */
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ── Typewriter ── */
function typeWriter(text, id, speed = 200) {
  let i = 0;
  const el = document.getElementById(id);
  function type() {
    if (i < text.length) { el.textContent += text.charAt(i); i++; setTimeout(type, speed); }
  }
  type();
}

/* ── Salva pezzo QR nel localStorage ── */
function unlockPiece(n) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (!saved.includes(n)) { saved.push(n); localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
  } catch(e) {}
}

/* ── Verifica risposta (usata da tutti gli enigma) ── */
async function check() {
  const inputRow = document.querySelector('.input-row');
  const input    = document.getElementById('ans');
  const val      = input.value.trim().toUpperCase();
  const msg      = document.getElementById('msg');
  const hash     = await sha256(val);

  inputRow.classList.remove('error', 'success');
  void inputRow.offsetWidth; // forza reflow per riavviare animazione

  if (hash === SOLUTION_HASH) {
    inputRow.classList.add('success');
    msg.style.color = 'var(--primary)';
    msg.textContent = '>> ACCESS_GRANTED... SYSTEM_OVERRIDE';
    input.disabled  = true;

    // suono successo
    try {
      const ctx  = new AudioContext();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch(e) {}

    unlockPiece(PIECE_NUMBER);

    setTimeout(() => document.body.classList.add('collapsing'), 300);

    setTimeout(() => {
      document.getElementById('main-ui').style.display = 'none';
      document.getElementById('success').style.display = 'flex';
      document.body.classList.remove('collapsing');

      setTimeout(() => {
        typeWriter(SUCCESS_TEXT, "typewriter", 250);
        setTimeout(() => document.getElementById('piece-notice').classList.add('visible'), 1000);
        setTimeout(() => { window.location.href = NEXT_URL; }, REDIRECT_DELAY);
      }, 500);
    }, 1800);

  } else {
    inputRow.classList.add('error');
    input.value     = '';
    msg.style.color = '#5e1111';
    msg.textContent = '>> ERROR: UNAUTHORIZED_BREACH_DETECTED';

    _failCount++;
    applyDegrade(_failCount);

    // warning a 10
    if (_failCount === 10) showWarning();

    // suono errore
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.frequency.value = 120;
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}

    setTimeout(() => {
      msg.textContent = '';
      inputRow.classList.remove('error');
    }, 2000);
  }
}

/* ── Decode animation ──
   Decodifica carattere per carattere da cipher → plain.
   Salta i non-lettere istantaneamente.
   Chiama questa funzione dall'IIFE specifica di ogni enigma. */
function runDecode(cipher, plain, selector, charDelay = 40, initialDelay = 1000) {
  const block = document.querySelector(selector);
  if (!block) return;

  block.innerHTML = '';
  const spans = [];

  for (let i = 0; i < cipher.length; i++) {
    if (cipher[i] === '\n') {
      block.appendChild(document.createElement('br'));
    } else {
      const span = document.createElement('span');
      span.className  = 'char';
      span.textContent = cipher[i];
      block.appendChild(span);
      spans.push({
        span,
        target:   plain[i] ?? cipher[i],
        isLetter: /[a-zA-Z]/.test(cipher[i])
      });
    }
  }

  // cursore alla fine
  const cur = document.createElement('span');
  cur.className = 'cursor';
  block.appendChild(cur);

  let i = 0;
  function decodeNext() {
    // salta non-lettere subito
    while (i < spans.length && !spans[i].isLetter) {
      spans[i].span.classList.add('decoded');
      i++;
    }
    if (i >= spans.length) return;

    const { span, target } = spans[i];
    span.classList.add('decoding');
    span.textContent = target;
    setTimeout(() => {
      span.classList.remove('decoding');
      span.classList.add('decoded');
      i++;
      setTimeout(decodeNext, charDelay);
    }, charDelay / 2);
  }

  setTimeout(decodeNext, initialDelay);
}

/* ── Bootlog sequence (solo enigma1) ── */
function runBootlog(onComplete) {
  const bootlog   = document.getElementById('bootlog');
  const logEl     = document.getElementById('bootlog-log');
  const barEl     = document.getElementById('bootlog-bar');
  const percentEl = document.getElementById('bootlog-percent');
  const statusEl  = document.getElementById('bootlog-status');
  const mainUI    = document.getElementById('main-ui');

  const bootMessages = [
    'INIT_KERNEL...', 'MOUNT /dev/null...', 'LOAD ENCRYPTION_MODULE...',
    'DECRYPT_X64_CORE... OK', 'ESTABLISH_SECURE_CHANNEL...',
    'VERIFY_IDENTITY_KEY 0x0168...', 'SIGNAL_ACQUIRED...',
    'DECODE_INCOMING_TRANSMISSION...', 'BUFFER_OVERFLOW_CHECK... CLEAN',
    'FINAL_SEQUENCE_DETECTED...', 'PREPARING_INTERFACE...', 'READY.'
  ];
  const statusMessages = [
    'INITIALIZING...', 'LOADING MODULES...', 'DECRYPTING CORE...',
    'ESTABLISHING LINK...', 'VERIFYING...', 'ACQUIRING SIGNAL...',
    'BUFFERING...', 'FINALIZING...'
  ];

  let progress = 0, logIndex = 0, statusIndex = 0;

  function updateBar() {
    const total  = 40;
    const filled = Math.floor((progress / 100) * total);
    let bar = '';
    for (let i = 0; i < filled; i++)
      bar += i < filled - 3 ? '█' : i < filled - 1 ? '▓' : '▒';
    bar += '░'.repeat(total - filled);
    barEl.textContent     = bar;
    percentEl.textContent = Math.floor(progress) + '%';
  }

  function addLogLine() {
    if (logIndex < bootMessages.length) {
      const div = document.createElement('div');
      div.textContent = '> ' + bootMessages[logIndex++];
      logEl.appendChild(div);
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  function updateStatus() {
    statusEl.textContent = statusMessages[Math.min(statusIndex++, statusMessages.length - 1)];
  }

  const interval = setInterval(() => {
    progress += Math.random() * 3 + 1;

    if (progress >= 100) {
      progress = 100;
      updateBar();
      statusEl.textContent = 'COMPLETE';
      addLogLine();
      clearInterval(interval);

      setTimeout(() => {
        bootlog.classList.add('hidden');
        mainUI.classList.add('loaded');
        setTimeout(() => onComplete && onComplete(), 500);
      }, 800);
      return;
    }

    updateBar();
    if (Math.random() > 0.6) addLogLine();
    if (Math.random() > 0.7) updateStatus();
  }, 80);
}

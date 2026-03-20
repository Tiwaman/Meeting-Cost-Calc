// ===================================
// Meeting Cost Calculator — Logic
// ===================================

const $ = (sel) => document.querySelector(sel);

// DOM refs
const attendeesInput = $('#attendees');
const salaryInput    = $('#salary');
const durationInput  = $('#duration');
const calculateBtn   = $('#calculateBtn');
const resultCard     = $('#resultCard');
const inputCard      = $('#inputCard');
const resultAmount   = $('#resultAmount');
const resultMessage  = $('#resultMessage');
const shameValue     = $('#shameValue');
const shameFill      = $('#shameFill');
const shareBtn       = $('#shareBtn');
const shareBtnText   = $('#shareBtnText');
const recalcBtn      = $('#recalcBtn');
const themeToggle    = $('#themeToggle');

// --- Constants ---
const WORKING_DAYS_PER_MONTH = 22;
const HOURS_PER_DAY          = 8;
const MINUTES_PER_HOUR       = 60;
const MINUTES_PER_MONTH      = WORKING_DAYS_PER_MONTH * HOURS_PER_DAY * MINUTES_PER_HOUR; // 10,560

// --- Theme ---
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const sunIcon = themeToggle.querySelector('.icon-sun');
  const moonIcon = themeToggle.querySelector('.icon-moon');
  if (theme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

// --- Calculation ---
function calculate(attendees, monthlySalary, durationMins) {
  const perMinute = monthlySalary / MINUTES_PER_MONTH;
  const totalCost = perMinute * attendees * durationMins;
  return Math.round(totalCost);
}

function getFunMessage(cost) {
  if (cost > 20000) return 'This meeting hurts 💀';
  if (cost > 10000) return 'Expensive meeting 😬';
  if (cost > 5000)  return "That's a pricey one 😭";
  if (cost > 2000)  return 'Starting to add up 😅';
  return 'Not bad, carry on 👍';
}

function getShameScore(cost) {
  const tiers = [
    { c: 0, s: 0 },
    { c: 2000, s: 20 },
    { c: 5000, s: 40 },
    { c: 10000, s: 60 },
    { c: 20000, s: 80 },
    { c: 50000, s: 95 }
  ];

  for (let i = 0; i < tiers.length - 1; i++) {
    if (cost <= tiers[i+1].c) {
      const t = (cost - tiers[i].c) / (tiers[i+1].c - tiers[i].c);
      return Math.min(100, Math.round(tiers[i].s + t * (tiers[i+1].s - tiers[i].s)));
    }
  }
  return 95 + Math.min(5, Math.round((cost - 50000) / 100000 * 5));
}

function getShameColor(score) {
  if (score <= 20) return 'var(--shame-green)';
  if (score <= 40) return 'var(--shame-lime)';
  if (score <= 60) return 'var(--shame-yellow)';
  if (score <= 80) return 'var(--shame-orange)';
  return 'var(--shame-red)';
}

// --- Format currency ---
function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

// --- Animated counter ---
function animateCounter(element, target, duration = 1200) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    element.textContent = formatCurrency(current);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// --- Validation ---
function validate() {
  const fields = [attendeesInput, salaryInput, durationInput];
  let valid = true;

  fields.forEach((field) => {
    const val = Number(field.value);
    if (!val || val <= 0) {
      field.classList.add('shake');
      field.addEventListener('animationend', () => field.classList.remove('shake'), { once: true });
      valid = false;
    }
  });

  return valid;
}

// --- Show Result ---
function showResult() {
  if (!validate()) return;

  const attendees = Number(attendeesInput.value);
  const salary    = Number(salaryInput.value);
  const duration  = Number(durationInput.value);

  const cost       = calculate(attendees, salary, duration);
  const message    = getFunMessage(cost);
  const shameScore = getShameScore(cost);
  const shameColor = getShameColor(shameScore);

  // Populate result
  resultMessage.textContent = message;
  shameValue.textContent    = shameScore + '/100';

  // Animate shame bar (defer to trigger CSS transition)
  shameFill.style.width = '0%';
  shameFill.style.backgroundColor = shameColor;

  // Reveal result card
  resultCard.classList.remove('hidden');
  // Re-trigger animation
  resultCard.style.animation = 'none';
  void resultCard.offsetHeight;
  resultCard.style.animation = '';

  // Animate counter
  animateCounter(resultAmount, cost);

  // Animate shame fill after a short delay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      shameFill.style.width = shameScore + '%';
    });
  });

  // Scroll to result
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);

  // Store for share
  resultCard.dataset.cost       = cost;
  resultCard.dataset.message    = message;
  resultCard.dataset.shame      = shameScore;
  resultCard.dataset.attendees  = attendees;
  resultCard.dataset.duration   = duration;
}

// --- Share / Copy ---
async function shareResult() {
  const { cost, message, shame, attendees, duration } = resultCard.dataset;

  const emoji = message.includes('💀') ? '💀' : message.includes('😬') ? '😬' : message.includes('😭') ? '😭' : '👍';
  const text = `My meeting just cost ${formatCurrency(Number(cost))} ${emoji}\n\nShame Score: ${shame}/100\n\nTry it: meeting-cost.app`;

  try {
    await navigator.clipboard.writeText(text);
    shareBtnText.textContent = 'Copied! ✓';
    shareBtn.classList.add('copied');
    setTimeout(() => {
      shareBtnText.textContent = 'Share Result';
      shareBtn.classList.remove('copied');
    }, 2500);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    shareBtnText.textContent = 'Copied! ✓';
    shareBtn.classList.add('copied');
    setTimeout(() => {
      shareBtnText.textContent = 'Share Result';
      shareBtn.classList.remove('copied');
    }, 2500);
  }
}

// --- Recalculate ---
function recalculate() {
  resultCard.classList.add('hidden');
  attendeesInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Event Listeners ---
calculateBtn.addEventListener('click', showResult);
shareBtn.addEventListener('click', shareResult);
recalcBtn.addEventListener('click', recalculate);
themeToggle.addEventListener('click', toggleTheme);

// Allow Enter key to calculate
[attendeesInput, salaryInput, durationInput].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') showResult();
  });
});

// Init theme on load
initTheme();

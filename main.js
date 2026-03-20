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
const durationSlider = $('#durationSlider');
const durationVal    = $('#durationVal');
const meetingType    = $('#meetingType');
const presetBtns     = document.querySelectorAll('.preset-btn');
const shareMenu      = $('#shareMenu');
const copyTextBtn    = $('#copyTextBtn');
const exportImgBtn   = $('#exportImgBtn');
const nativeShareBtn = $('#nativeShareBtn');
const headerTitle    = $('#headerTitle');
const usefulInputs    = document.getElementsByName('useful');

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

// --- Presets ---
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    salaryInput.value = btn.dataset.value;
    presetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// --- Duration Sync ---
durationSlider.addEventListener('input', (e) => {
  durationInput.value = e.target.value;
  durationVal.textContent = e.target.value;
});

durationInput.addEventListener('input', (e) => {
  durationSlider.value = e.target.value;
  durationVal.textContent = e.target.value;
});

// --- Calculation ---
function calculate(attendees, monthlySalary, durationMins) {
  const perMinute = monthlySalary / MINUTES_PER_MONTH;
  const totalCost = perMinute * attendees * durationMins;
  return Math.round(totalCost);
}

function getFunMessage(cost, isUseful, type) {
  if (!isUseful) {
    return `${formatCurrency(cost)} for a ${type}?? 💀`;
  }
  if (cost < 2000)   return "Not terrible 🙂";
  if (cost < 5000)   return "This could’ve been an email 😬";
  if (cost < 15000)  return "Expensive meeting 💸";
  if (cost < 50000)  return "This hurts 😵";
  return "WHAT ARE YOU DOING 💀";
}

function getWasteLevel(cost, isUseful) {
  let score = 0;
  if (cost < 2000) score = 0;
  else if (cost < 5000) score = 1;
  else if (cost < 15000) score = 2;
  else score = 3;

  if (!isUseful) score = Math.min(3, score + 1);

  const levels = [
    { label: "LOW 🟢", color: "var(--shame-green)", progress: 25 },
    { label: "MEDIUM 😐", color: "var(--shame-yellow)", progress: 50 },
    { label: "HIGH 😬", color: "var(--shame-orange)", progress: 75 },
    { label: "INSANE 💀", color: "var(--shame-red)", progress: 100 }
  ];
  return levels[score];
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
  const type      = meetingType.value;
  const isUseful   = Array.from(usefulInputs).find(i => i.checked).value === 'yes';

  const cost       = calculate(attendees, salary, duration);
  const message    = getFunMessage(cost, isUseful, type);
  const waste      = getWasteLevel(cost, isUseful);

  // Update Headline
  headerTitle.innerHTML = `This meeting just<br/>wasted ${formatCurrency(cost)} 😬`;

  // Populate result
  resultMessage.textContent = message;
  shameValue.textContent    = waste.label;

  // Animate shame bar (defer to trigger CSS transition)
  shameFill.style.width = '0%';
  shameFill.style.backgroundColor = waste.color;

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
      shameFill.style.width = waste.progress + '%';
    });
  });

  // Step 2: Collapse input form
  inputCard.classList.add('card--minimized');

  // Step 2: Emoji Pop
  const emoji = document.createElement('div');
  emoji.className = 'emoji-pop';
  emoji.textContent = waste.label.split(' ')[1] || '😬';
  document.body.appendChild(emoji);
  setTimeout(() => emoji.remove(), 2000);

  // Scroll to result
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);

  // Store for share
  resultCard.dataset.cost       = cost;
  resultCard.dataset.message    = message;
  resultCard.dataset.shame      = waste.label;
  resultCard.dataset.attendees  = attendees;
  resultCard.dataset.duration   = duration;
}

// --- Share / Copy ---
function toggleShareMenu(e) {
  e.stopPropagation();
  shareMenu.classList.toggle('hidden');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!shareMenu.classList.contains('hidden') && !e.target.closest('.share-container')) {
    shareMenu.classList.add('hidden');
  }
});

async function copyResultText() {
  const { cost, shame, duration } = resultCard.dataset;
  const text = `I just calculated my meeting cost.

${formatCurrency(Number(cost))} for ${duration} mins 😬

Waste Level: ${shame}

Try it: meeting-cost.app`;

  try {
    await navigator.clipboard.writeText(text);
    const originalText = shareBtnText.textContent;
    shareBtnText.textContent = 'Copied! ✓';
    shareBtn.classList.add('copied');
    shareMenu.classList.add('hidden');
    
    setTimeout(() => {
      shareBtnText.textContent = originalText;
      shareBtn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error('Copy failed', err);
  }
}

async function downloadResultImage() {
  const originalBtnText = shareBtnText.textContent;
  shareBtnText.textContent = 'Generating...';
  shareMenu.classList.add('hidden');

  try {
    const dataUrl = await htmlToImage.toPng(resultCard, {
      backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#09090b' : '#ffffff',
      filter: (node) => {
        // Exclude the actions div and the share menu
        if (node.classList && (node.classList.contains('result__actions') || node.classList.contains('share-menu'))) {
          return false;
        }
        return true;
      },
      style: {
        transform: 'scale(1)',
        margin: '0',
      }
    });

    const link = document.createElement('a');
    link.download = `meeting-cost-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    shareBtnText.textContent = 'Downloaded! ✓';
    setTimeout(() => {
      shareBtnText.textContent = originalBtnText;
    }, 2000);
  } catch (err) {
    console.error('Export failed', err);
    shareBtnText.textContent = 'Export Failed';
    setTimeout(() => {
      shareBtnText.textContent = originalBtnText;
    }, 2000);
  }
}

async function shareResultNative() {
  const { cost, shame, duration } = resultCard.dataset;
  const originalBtnText = shareBtnText.textContent;
  
  if (!navigator.share) {
    alert('Native sharing is not supported in this browser.');
    return;
  }

  shareBtnText.textContent = 'Preparing...';
  shareMenu.classList.add('hidden');

  try {
    // Generate the blob
    const dataUrl = await htmlToImage.toPng(resultCard, {
      backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#09090b' : '#ffffff',
      filter: (node) => {
        if (node.classList && (node.classList.contains('result__actions') || node.classList.contains('share-menu'))) {
          return false;
        }
        return true;
      },
      style: { transform: 'scale(1)', margin: '0' }
    });

    const res  = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `meeting-cost-${Date.now()}.png`, { type: 'image/png' });

    const text = `I just calculated my meeting cost: ${formatCurrency(Number(cost))} for ${duration} mins. Waste Level: ${shame}. Try it: meeting-cost.app`;

    const shareData = {
      title: 'Meeting Cost Result',
      text: text,
      files: [file]
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      shareBtnText.textContent = 'Shared! ✓';
    } else {
      // Fallback if files can't be shared
      await navigator.share({
        title: 'Meeting Cost Result',
        text: text
      });
      shareBtnText.textContent = 'Text Shared! ✓';
    }

    setTimeout(() => {
      shareBtnText.textContent = originalBtnText;
    }, 2000);
  } catch (err) {
    console.error('Native share failed', err);
    shareBtnText.textContent = 'Share Failed';
    setTimeout(() => {
      shareBtnText.textContent = originalBtnText;
    }, 2000);
  }
}

// Check for Web Share support
function checkShareSupport() {
  if (!navigator.share) {
    nativeShareBtn.style.display = 'none';
  }
}

// --- Recalculate ---
function recalculate() {
  resultCard.classList.add('hidden');
  inputCard.classList.remove('card--minimized');
  headerTitle.innerHTML = `This meeting is<br/>burning money 💸`;
  attendeesInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Event Listeners ---
calculateBtn.addEventListener('click', showResult);
shareBtn.addEventListener('click', toggleShareMenu);
copyTextBtn.addEventListener('click', copyResultText);
exportImgBtn.addEventListener('click', downloadResultImage);
nativeShareBtn.addEventListener('click', shareResultNative);
recalcBtn.addEventListener('click', recalculate);
themeToggle.addEventListener('click', toggleTheme);

// Allow Enter key to calculate
[attendeesInput, salaryInput, durationInput].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') showResult();
  });
});

// Init theme and features on load
checkShareSupport();
initTheme();

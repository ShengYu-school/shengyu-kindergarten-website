const toggle = document.getElementById('nav-toggle');
const nav = document.getElementById('site-nav');

if (toggle && nav) {
  const closeNavigation = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '開啟選單');
  };

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  });

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeNavigation();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeNavigation();
      toggle.focus();
    }
  });
}

// 課程卡內文：優先在標點處斷行，必要時再依可容納字數安全換行。
const punctuationParagraphs = document.querySelectorAll('[data-punctuation-wrap]');
const strongBreaks = new Set(['。', '；', ';', '—', '–', '―', '─', '－', '﹘', '﹣']);
const weakBreaks = new Set(['，', '、', '：', ':', '！', '!', '？', '?', '）', '」', '』', '》', '〉', '】']);
const measureCanvas = document.createElement('canvas');
const measureContext = measureCanvas.getContext('2d');
let resizeTimer;

function textWidth(text, styles) {
  measureContext.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
  const letterSpacing = Number.parseFloat(styles.letterSpacing) || 0;
  return measureContext.measureText(text).width + Math.max(0, Array.from(text).length - 1) * letterSpacing;
}

function renderLines(element, lines) {
  const fragment = document.createDocumentFragment();

  lines.forEach((line, index) => {
    if (index) fragment.append(document.createElement('br'));
    const lineElement = document.createElement('span');
    lineElement.className = 'punctuation-line';
    lineElement.textContent = line;
    fragment.append(lineElement);
  });

  element.replaceChildren(fragment);
}

function punctuationLines(text, maxWidth, styles) {
  const characters = Array.from(text);
  const lines = [];
  let start = 0;

  while (start < characters.length) {
    let end = start;

    while (end < characters.length && textWidth(characters.slice(start, end + 1).join(''), styles) <= maxWidth) {
      end += 1;
    }

    if (end === characters.length) {
      lines.push(characters.slice(start).join(''));
      break;
    }

    const fittingCharacters = characters.slice(start, end);
    let strongIndex = -1;
    let weakIndex = -1;

    fittingCharacters.forEach((character, index) => {
      if (strongBreaks.has(character)) strongIndex = index;
      if (weakBreaks.has(character)) weakIndex = index;
    });

    const breakIndex = strongIndex >= 0 ? strongIndex : weakIndex;

    // 標點超出欄寬時以實際可容納字元安全斷行，避免整句溢出卡片。
    if (breakIndex < 0) {
      const fallbackLength = Math.max(1, fittingCharacters.length);
      lines.push(characters.slice(start, start + fallbackLength).join(''));
      start += fallbackLength;
      continue;
    }

    lines.push(fittingCharacters.slice(0, breakIndex + 1).join(''));
    start += breakIndex + 1;
  }

  return lines;
}

function applyPunctuationWraps() {
  punctuationParagraphs.forEach((paragraph) => {
    const originalText = paragraph.dataset.originalText ?? paragraph.textContent.trim();
    paragraph.dataset.originalText = originalText;
    paragraph.textContent = originalText;

    const lines = punctuationLines(originalText, paragraph.clientWidth, getComputedStyle(paragraph));
    renderLines(paragraph, lines);
  });
}

function schedulePunctuationWraps() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(applyPunctuationWraps, 100);
}

window.addEventListener('resize', schedulePunctuationWraps);
if (document.fonts?.ready) {
  document.fonts.ready.then(applyPunctuationWraps);
} else {
  applyPunctuationWraps();
}


// Keep native touch scrolling and buttons in sync; do not advance automatically.
const campusTrack = document.querySelector('.campus-track');
if (campusTrack) {
  const previous = document.querySelector('.campus-prev');
  const next = document.querySelector('.campus-next');
  const photos = [...campusTrack.querySelectorAll('figure')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let positionTimer;
  function campusMetrics() {
    const step = photos[0].getBoundingClientRect().width + parseFloat(getComputedStyle(campusTrack).gap);
    return { step, visible: Math.max(1, Math.floor((campusTrack.clientWidth + parseFloat(getComputedStyle(campusTrack).gap) + 1) / step)) };
  }
  function updateCampusPosition() {
    previous.disabled = campusTrack.scrollLeft <= 2;
    next.disabled = campusTrack.scrollLeft >= campusTrack.scrollWidth - campusTrack.clientWidth - 2;
  }
  function moveCampus(direction) {
    const { step, visible } = campusMetrics();
    campusTrack.scrollBy({ left: direction * step * visible, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }
  previous.addEventListener('click', () => moveCampus(-1));
  next.addEventListener('click', () => moveCampus(1));
  campusTrack.addEventListener('keydown', event => {
    if (event.target !== campusTrack || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') moveCampus(event.key === 'ArrowLeft' ? -1 : 1);
    else campusTrack.scrollTo({ left: event.key === 'Home' ? 0 : campusTrack.scrollWidth, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });
  campusTrack.addEventListener('scroll', () => {
    clearTimeout(positionTimer);
    positionTimer = setTimeout(updateCampusPosition, 120);
  }, { passive: true });
  new ResizeObserver(updateCampusPosition).observe(campusTrack);
  updateCampusPosition();
}


// Tap the photo to control playback; pause outside the viewport or after choosing a photo.
const aboutCarousel = document.querySelector('.about-carousel');
if (aboutCarousel) {
  const slides = [...aboutCarousel.querySelectorAll('.about-slide')];
  const dots = [...aboutCarousel.querySelectorAll('.about-dot')];
  const toggle = aboutCarousel.querySelector('.about-autoplay');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer, visible = false, feedbackAnimation;
  let paused = motion.matches, request = 0;
  const allowed = () => !paused && visible && !document.hidden;
  function schedule() {
    clearTimeout(timer);
    if (allowed()) {
      // Prepare the next photo during the current photo's viewing time.
      slides[(current + 1) % slides.length].loading = 'eager';
      slides[(current + 1) % slides.length].decode().catch(() => {});
    }
    if (allowed()) timer = setTimeout(async () => {
      await show((current + 1) % slides.length);
      schedule();
    }, 3000);
  }
  function updateToggle() {
    toggle.setAttribute('aria-label', paused ? '播放照片輪播' : '暫停照片輪播');
  }
  async function show(index) {
    const token = ++request;
    try { await slides[index].decode(); } catch { return; }
    if (token !== request) return;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
      dots[i].setAttribute('aria-current', String(i === index));
    });
    current = index;
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    paused = true;
    updateToggle();
    schedule();
    show(index);
  }));
  toggle.addEventListener('click', () => {
    paused = !paused;
    if (paused) request++;
    toggle.dataset.action = paused ? 'pause' : 'play';
    feedbackAnimation?.cancel();
    feedbackAnimation = toggle.querySelector('.about-playback-feedback').animate([
      { opacity: .85, transform: 'scale(.92)' },
      { opacity: .85, transform: 'scale(1)', offset: .3 },
      { opacity: 0, transform: motion.matches ? 'scale(1)' : 'scale(1.12)' }
    ], { duration: motion.matches ? 250 : 450, easing: 'cubic-bezier(.25,1,.5,1)' });
    updateToggle();
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; updateToggle(); schedule(); });
  new IntersectionObserver(entries => {
    const nextVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
    if (nextVisible === visible) return;
    visible = nextVisible;
    schedule();
  }, { threshold: .25 }).observe(aboutCarousel);
  updateToggle();
  toggle.hidden = false;
  aboutCarousel.querySelector('.about-carousel-controls').hidden = false;
}

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

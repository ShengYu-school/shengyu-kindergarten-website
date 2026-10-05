(() => {
  const grid = document.querySelector('[data-bulletin-grid]');
  const config = window.SUN_YOU_SANITY_CONFIG;

  if (!grid || !config?.projectId || !config.dataset || !config.apiVersion) return;

  const categoryLabels = {
    fees: '行政公告',
    medication: '照護服務',
    safety: '校園安全',
    dailyRoutine: '生活資訊',
    other: '校園公告',
  };

  const query = `*[_type == "bulletin" && status == "active"] | order(isFeatured desc, publishedAt desc, _createdAt desc)[0...4]{
    _id,
    title,
    category,
    summary,
    buttonLabel,
    externalUrl,
    publishedAt,
    "attachmentUrl": attachment.asset->url,
    "attachmentName": attachment.asset->originalFilename
  }`;

  const safeUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return null;

    try {
      const url = new URL(value, window.location.origin);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };

  const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  const renderBulletin = (bulletin) => {
    const card = createElement('article', 'bulletin-card');
    const body = createElement('div', 'bulletin-body');
    const category = categoryLabels[bulletin.category] || categoryLabels.other;
    const attachmentUrl = safeUrl(bulletin.attachmentUrl);
    const externalUrl = safeUrl(bulletin.externalUrl);
    const destination = attachmentUrl || externalUrl;

    body.append(
      createElement('p', 'bulletin-meta', category),
      createElement('h3', '', bulletin.title || '校園公告'),
      createElement('p', '', bulletin.summary || '最新園務資訊將於近期更新。'),
    );

    if (destination) {
      const link = createElement('a', 'bulletin-link', bulletin.buttonLabel || (attachmentUrl ? '下載公告' : '查看公告'));
      link.href = destination;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (attachmentUrl && bulletin.attachmentName) link.setAttribute('download', bulletin.attachmentName);
      body.append(link);
    } else {
      body.append(createElement('span', 'bulletin-status', '詳細資訊將於近期更新'));
    }

    card.append(body);
    return card;
  };

  const renderEmptyState = () => {
    const emptyState = createElement('p', 'bulletin-empty', '將於近期公告');
    grid.replaceChildren(emptyState);
  };

  const loadBulletins = async () => {
    const endpoint = new URL(
      `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`,
    );
    endpoint.searchParams.set('query', query);
    endpoint.searchParams.set('perspective', 'published');

    grid.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(endpoint, {headers: {Accept: 'application/json'}});
      if (!response.ok) throw new Error(`Sanity request failed: ${response.status}`);

      const payload = await response.json();
      const bulletins = Array.isArray(payload.result) ? payload.result : [];

      if (!bulletins.length) {
        renderEmptyState();
        return;
      }

      grid.replaceChildren(...bulletins.map(renderBulletin));
    } catch (error) {
      // 保留 HTML 中的預設公告，避免 CMS 或網路短暫異常時出現空白區塊。
      console.warn('Unable to load campus bulletins from Sanity.', error);
    } finally {
      grid.setAttribute('aria-busy', 'false');
    }
  };

  loadBulletins();
})();

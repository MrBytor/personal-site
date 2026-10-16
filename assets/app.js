import { escapeHtml, navigationSection, routeFromUrl, routeHref, routeKind } from './site-core.mjs';
import { renderStatisticsWeek, renderFinanceWeek } from './page-templates.mjs';

const main = document.getElementById('main');
const menu = document.getElementById('main-menu');
const menuButton = document.querySelector('[data-menu-toggle]');
const header = document.querySelector('.site-header');
const pageStyles = document.getElementById('page-styles');
const base = new URL('../', import.meta.url);
const dataCache = new Map();
const closeMenu = () => {
  menu.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
};
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
const measureHeader = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
measureHeader();
if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
else window.addEventListener('resize', measureHeader);

async function loadData(file) {
  if (!dataCache.has(file)) {
    dataCache.set(file, (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(new URL(`content/${file}`, base), { signal: controller.signal });
        if (!response.ok) throw new Error('Content unavailable');
        const data = await response.json();
        if (data.version !== 1) throw new Error('Unsupported content format');
        return data;
      } finally { clearTimeout(timeout); }
    })().catch((error) => { dataCache.delete(file); throw error; }));
  }
  return dataCache.get(file);
}

async function loadPage(route) {
  if (routeKind(route) === 'statistics') return renderStatisticsWeek(Number(route.slice(-2)), await loadData('statistics.json'));
  if (routeKind(route) === 'finance') return renderFinanceWeek(Number(route.slice(-2)), await loadData('corporate-finance.json'));
  const data = await loadData('pages.json');
  if (data.pages[route]) return data.pages[route];
  return { title: 'Page not found · Jacob Mlynarski', description: 'This page could not be found.', bodyClass: '', styles: [],
    content: `<section class="section"><div class="container"><h1>Page not found</h1><p>This page is not available. ${`<a href="${routeHref('home')}">Return to Home</a>`}</p></div></section>` };
}

const announcement = document.createElement('div');
announcement.className = 'route-announcement';
announcement.setAttribute('role', 'status');
announcement.setAttribute('aria-live', 'polite');
document.body.append(announcement);
history.scrollRestoration = 'manual';
let currentUrl = new URL(location.href);
let displayedKey;
let sequence = 0;
let loading = false;
let scrollFrame;
let animation;
const keyFor = (url) => `${routeFromUrl(url, base)}?${url.searchParams}`;
function saveScroll() {
  if (!loading && displayedKey === keyFor(new URL(location.href))) {
    history.replaceState({ ...history.state, scroll: [scrollX, scrollY] }, '', location.href);
  }
}
function positionPage(url, scroll) {
  if (Array.isArray(scroll) && scroll.length === 2 && scroll.every(Number.isFinite)) {
    window.scrollTo(...scroll);
    return;
  }
  let id;
  try { id = decodeURIComponent(url.hash.slice(1)); } catch { id = url.hash.slice(1); }
  const target = id && document.getElementById(id);
  if (target) {
    for (let node = target; node && node !== main; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
    target.scrollIntoView({ block: 'start' });
  } else window.scrollTo(0, 0);
}
function markNavigation(route) {
  for (const item of menu.querySelectorAll('a')) {
    if (routeFromUrl(new URL(item.href), base) === navigationSection(route)) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  }
}
async function mountPractice(token) {
  const container = document.getElementById('statistics-practice');
  if (!container) return;
  try {
    const module = await import('./statistics-practice.js?v=20261016-objective-selection');
    if (token === sequence && container.isConnected) await module.mount(container);
  } catch {
    if (token === sequence && container.isConnected) container.innerHTML = '<p role="alert">Practice could not load. Refresh the page to try again.</p>';
  }
}

async function navigate(url, { push = false, scroll } = {}) {
  const route = routeFromUrl(url, base);
  if (route === null) return;
  if (push) saveScroll();
  const token = ++sequence;
  animation?.cancel();
  closeMenu();
  if (push && url.href !== location.href) history.pushState({ scroll: null }, '', url.href);
  currentUrl = url;
  if (displayedKey === keyFor(url)) {
    loading = false;
    main.removeAttribute('aria-busy');
    document.documentElement.classList.remove('is-routing');
    positionPage(url, scroll);
    saveScroll();
    return;
  }
  loading = true;
  main.setAttribute('aria-busy', 'true');
  document.documentElement.classList.add('is-routing');
  try {
    const page = await loadPage(route);
    if (token !== sequence) return;
    if (displayedKey && !matchMedia('(prefers-reduced-motion: reduce)').matches && main.animate) {
      animation = main.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100 });
      await animation.finished.catch(() => {});
      if (token !== sequence) return;
    }
    pageStyles.textContent = page.styles.join('\n');
    main.innerHTML = page.content;
    document.title = page.title;
    document.querySelector('meta[name="description"]').content = page.description;
    document.body.className = page.bodyClass;
    displayedKey = keyFor(url);
    markNavigation(route);
    const heading = main.querySelector('h1');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    positionPage(url, scroll);
    announcement.textContent = `${page.title} loaded.`;
    void mountPractice(token);
  } catch {
    if (token !== sequence) return;
    displayedKey = undefined;
    pageStyles.textContent = '';
    document.body.className = '';
    document.title = 'Page could not load · Jacob Mlynarski';
    main.innerHTML = `<section class="section"><div class="container"><h1>Page could not load</h1><p role="alert">Please check your connection and try again.</p><button class="btn btn-primary" type="button" data-retry-page>Try again</button> <a href="${escapeHtml(routeHref('home'))}">Home</a></div></section>`;
  } finally {
    if (token === sequence) {
      loading = false;
      animation = null;
      main.removeAttribute('aria-busy');
      document.documentElement.classList.remove('is-routing');
      saveScroll();
    }
  }
}

document.addEventListener('click', (event) => {
  const retry = event.target.closest('[data-retry-page]');
  if (retry) { void navigate(new URL(location.href)); return; }
  const toggle = event.target.closest('[data-publication-toggle]');
  if (toggle) {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (panel) {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    }
    return;
  }
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest('a[href]');
  if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
  const url = new URL(anchor.href);
  if (routeFromUrl(url, base) === null) return;
  event.preventDefault();
  void navigate(url, { push: true });
});
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy-citation]');
  if (!button) return;
  const panel = button.closest('[data-citation-panel], details');
  const status = panel?.querySelector('.copy-status');
  if (!status) return;
  try {
    await navigator.clipboard.writeText(panel.querySelector('code').textContent);
    status.textContent = 'Copied';
  } catch { status.textContent = 'Select the citation above to copy it.'; }
});
window.addEventListener('scroll', () => {
  if (scrollFrame || loading) return;
  scrollFrame = requestAnimationFrame(() => { scrollFrame = null; saveScroll(); });
}, { passive: true });
window.addEventListener('popstate', (event) => { void navigate(new URL(location.href), { scroll: event.state?.scroll }); });
window.addEventListener('hashchange', () => {
  const url = new URL(location.href);
  if (!loading && displayedKey === keyFor(url)) { currentUrl = url; positionPage(url); }
});
void navigate(currentUrl, { scroll: history.state?.scroll });

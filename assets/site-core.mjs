const sections = new Set(['home', 'courses', 'publications', 'about-me', 'statistics',
  'corporate-finance', 'project-management', 'statistics-practice']);

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export function validRoute(route) {
  if (sections.has(route)) return true;
  let match = /^statistics-week-(\d{2})$/.exec(route);
  if (match) return Number(match[1]) >= 1 && Number(match[1]) <= 12;
  match = /^statistics-week-(\d{2})-d$/.exec(route);
  if (match) return [2, 5, 8, 11].includes(Number(match[1]));
  match = /^corporate-finance-week-(\d{2})$/.exec(route);
  return Boolean(match && Number(match[1]) >= 1 && Number(match[1]) <= 16);
}

export function routeHref(route, hash = '', parameters = {}) {
  const query = new URLSearchParams(parameters);
  query.delete('page');
  if (route !== 'home') query.set('page', route);
  return `index.html${query.size ? `?${query}` : ''}${hash ? `#${hash.replace(/^#/, '')}` : ''}`;
}

export function routeFromUrl(url, base) {
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return null;
  const path = url.pathname.slice(base.pathname.length);
  if (path !== '' && path !== 'index.html') return null;
  const name = url.searchParams.get('page') || 'home';
  return validRoute(name) ? name : 'not-found';
}

export function navigationSection(route) {
  return ['home', 'publications', 'about-me'].includes(route) ? route : 'courses';
}

export function routeKind(route) {
  if (/^statistics-week-\d{2}$/.test(route)) return 'statistics';
  if (/^corporate-finance-week-\d{2}$/.test(route)) return 'finance';
  return 'section';
}

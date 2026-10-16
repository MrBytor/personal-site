import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { escapeHtml, navigationSection, routeFromUrl, routeHref, validRoute } from '../assets/site-core.mjs';
import { renderStatisticsWeek, renderFinanceWeek } from '../assets/page-templates.mjs';

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../content/${name}`, import.meta.url), 'utf8'));
const statistics = read('statistics.json');
const finance = read('corporate-finance.json');
const pages = { ...read('pages.json').pages };
for (let week = 1; week <= 12; week++) pages[`statistics-week-${String(week).padStart(2, '0')}`] = renderStatisticsWeek(week, statistics);
for (let week = 1; week <= 16; week++) pages[`corporate-finance-week-${String(week).padStart(2, '0')}`] = renderFinanceWeek(week, finance);
const base = new URL('https://example.com/personal-site/');
const decode = (value) => value.replaceAll('&amp;', '&');

test('every section, tutorial and week is available without individual HTML pages', () => {
  assert.equal(Object.keys(pages).length, 40);
  assert.equal(fs.readdirSync(new URL('../', import.meta.url)).filter((name) => name.endsWith('.html')).length, 2);
  for (const [name, page] of Object.entries(pages)) {
    assert.ok(validRoute(name), name);
    assert.ok(page.title && page.description && page.content.includes('<h1'), name);
    assert.ok(!page.content.includes('class="site-header"'), name);
    assert.ok(!page.content.includes('class="site-footer"'), name);
  }
});

test('all internal content links and fragments resolve at a GitHub Pages subdirectory', () => {
  for (const [name, page] of Object.entries(pages)) {
    const current = new URL(routeHref(name), base);
    for (const match of page.content.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(decode(match[1]), current);
      if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) continue;
      const route = routeFromUrl(url, base);
      if (route !== null) {
        assert.ok(pages[route], `${name}: unknown route ${match[1]}`);
        if (url.hash) {
          const id = decodeURIComponent(url.hash.slice(1));
          assert.ok(id === 'main' || pages[route].content.includes(`id="${id}"`), `${name}: missing fragment ${match[1]}`);
        }
      } else {
        const path = decodeURIComponent(url.pathname.slice(base.pathname.length));
        assert.ok(fs.existsSync(new URL(`../${path}`, import.meta.url)), `${name}: missing file ${path}`);
      }
    }
  }
});

test('routes preserve objective filters, anchors and site-relative URLs', () => {
  const url = new URL(routeHref('statistics-practice', 'practice-settings', { objective: '1A.3' }), base);
  assert.equal(routeFromUrl(url, base), 'statistics-practice');
  assert.equal(url.searchParams.get('objective'), '1A.3');
  assert.equal(url.hash, '#practice-settings');
  assert.equal(routeFromUrl(new URL('https://other.example/index.html?page=courses'), base), null);
  assert.equal(routeFromUrl(new URL('../index.html?page=courses', base), base), null);
  assert.equal(routeFromUrl(new URL('index.html?page=unknown', base), base), 'not-found');
  assert.equal(navigationSection('statistics-week-01'), 'courses');
  for (const route of ['statistics-week-00', 'statistics-week-13', 'statistics-week-03-d', 'corporate-finance-week-17', '../about-me']) assert.equal(validRoute(route), false);
});

test('every supplied teaching download remains reachable from course content', () => {
  const linked = new Set(Object.values(pages).flatMap((page) =>
    [...page.content.matchAll(/href="(materials\/[^"]+)"/g)].map((match) => decodeURIComponent(decode(match[1])))));
  const root = new URL('../materials/', import.meta.url);
  for (const name of fs.readdirSync(root, { recursive: true })) {
    if (fs.statSync(new URL(name.replaceAll('\\', '/'), root)).isFile()) {
      assert.ok(linked.has(`materials/${name.replaceAll('\\', '/')}`), `Download no longer linked: ${name}`);
    }
  }
});

test('all 76 former page addresses map to valid routes and existing anchors', () => {
  const aliases = read('legacy-routes.json');
  assert.equal(Object.keys(aliases).length, 76);
  for (const [filename, target] of Object.entries(aliases)) {
    const url = new URL(target, base);
    const route = routeFromUrl(url, base);
    assert.ok(pages[route], filename);
    if (url.hash) assert.ok(pages[route].content.includes(`id="${url.hash.slice(1)}"`), filename);
  }
});

test('weekly templates retain curriculum objectives, coverage and available materials', () => {
  for (const lesson of statistics.lessons.filter((item) => item.letter !== 'D')) {
    const page = pages[`statistics-week-${String(lesson.week).padStart(2, '0')}`];
    for (const value of [lesson.title, lesson.description, ...lesson.coverage, ...lesson.objectives]) assert.ok(page.content.includes(escapeHtml(value)), `${lesson.week}${lesson.letter}: ${value}`);
    for (const item of lesson.materials.filter((item) => item.href)) assert.ok(page.content.includes(escapeHtml(item.href)), item.href);
  }
  for (const week of finance.weeks) {
    const page = pages[`corporate-finance-week-${String(week.week).padStart(2, '0')}`];
    for (const value of [week.title, week.description, ...week.coverage, ...week.objectives]) assert.ok(page.content.includes(escapeHtml(value)), value);
  }
  const data = structuredClone(finance);
  data.weeks[0].title = '<script>alert("test")</script>';
  assert.ok(renderFinanceWeek(1, data).content.includes('&lt;script&gt;'));
  assert.ok(!renderFinanceWeek(1, data).content.includes('<script>'));
});

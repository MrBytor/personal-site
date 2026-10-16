import { escapeHtml as e, routeHref } from './site-core.mjs';

const link = (route, text, hash = '') => `<a href="${e(routeHref(route, hash))}">${text}</a>`;
const number = (week) => String(week).padStart(2, '0');
const downloadIcon = '<svg class="download-icon week-download-arrow" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2h6v9h4l-7 7-7-7h4zM3 19h3v2h12v-2h3v5H3z"/></svg>';

function resource(item, title, context) {
  if (!item?.href) return `<div class="week-download week-download-pending"><span>${e(title)}</span><small>${e(item?.label || 'Not available yet')}</small></div>`;
  const url = item.href;
  // Course data contains only local files or explicit HTTP(S) resources.
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url) && !/^https?:\/\//i.test(url)) throw new Error('Unsupported download URL');
  const details = [item.format, item.size].filter(Boolean).join(' · ');
  const attributes = /^https?:\/\//i.test(url) ? 'target="_blank" rel="noopener noreferrer"' : 'download';
  return `<a class="week-download" href="${e(url)}" ${attributes} aria-label="Download ${e(context)} ${e(title)}"><span>${e(title)}</span><small>${e(details)}</small>${downloadIcon}</a>`;
}

function adjacentWeeks(week, maximum, routePrefix, titleFor) {
  return `<nav class="lesson-navigation" aria-label="Week navigation">${[-1, 1].map((offset) => {
    const next = week + offset;
    if (next < 1 || next > maximum) return '';
    return `<a class="lesson-${offset < 0 ? 'previous' : 'next'}" href="${routeHref(`${routePrefix}${number(next)}`)}"><small>${offset < 0 ? 'Previous' : 'Next'} week</small><span>Week ${next}</span><strong>${e(titleFor(next))}</strong></a>`;
  }).join('')}</nav>`;
}

export function renderStatisticsWeek(week, data) {
  const classes = data.lessons.filter((item) => item.week === week && 'ABC'.includes(item.letter));
  const weekly = data.weeklyOverviews[String(week)];
  if (classes.length !== 3 || !weekly) throw new Error('Week unavailable');
  const title = classes[0].weekTitle;
  const sections = classes.map((lesson) => {
    const letter = lesson.letter.toLowerCase();
    const materials = [];
    for (const [role, label] of [['slides', 'PowerPoint'], ['handout', 'Handout']]) {
      const items = lesson.materials.filter((item) => item.role === role);
      for (const item of items.length ? items : [null]) {
        let name = item?.label || label;
        if (['Class PowerPoint', 'Class handout', 'PowerPoint upload pending', 'Handout under revision'].includes(name)) name = label;
        materials.push(resource(item, name, `Week ${week} Class ${lesson.letter}`));
      }
    }
    for (const item of lesson.materials.filter((item) => item.role === 'lesson-plan')) {
      materials.push(resource(item, item.label || 'Lesson plan', `Week ${week} Class ${lesson.letter}`));
    }
    return `<section class="week-class" id="class-${letter}" aria-labelledby="class-${letter}-heading">
      <div class="week-class-heading"><div><p class="week-kicker">Class ${lesson.letter} <span>90 minutes</span></p><h2 id="class-${letter}-heading">${e(lesson.title)}</h2></div><a class="week-objectives-link" href="#objectives-${letter}">Learning objectives</a></div>
      <div class="week-class-layout"><div class="week-class-copy"><p class="week-class-description">${e(lesson.description)}</p>${lesson.coverage.length ? `<h3>What this class covers</h3><ul class="week-coverage">${lesson.coverage.map((point) => `<li>${e(point)}</li>`).join('')}</ul>` : ''}</div>
      <aside class="week-class-materials" aria-labelledby="class-${letter}-materials"><h3 id="class-${letter}-materials">Class ${lesson.letter} materials</h3>${materials.join('')}<p>Keep your class materials together for revision.</p></aside></div></section>`;
  }).join('');
  const objectives = classes.map((lesson) => {
    const letter = lesson.letter.toLowerCase();
    return `<section class="week-objective-group" id="objectives-${letter}" aria-labelledby="objectives-${letter}-heading"><div><h3 id="objectives-${letter}-heading">Class ${lesson.letter}</h3><p>${e(lesson.title)}</p><a href="#class-${letter}">Back to class</a></div><ol class="week-objectives-list">${lesson.objectives.map((point, index) => `<li id="objective-${week}${letter}-${index + 1}"><span class="week-objective-code">${week}${lesson.letter}.${index + 1}</span><span>${e(point)}</span></li>`).join('')}</ol></section>`;
  }).join('');
  const tutorial = data.lessons.find((item) => item.week === week && item.letter === 'D');
  const content = `<section class="course-banner lesson-banner week-banner"><div class="container"><p class="breadcrumbs">${link('home', 'Home')} / ${link('courses', 'Courses')} / ${link('statistics', 'Statistics')} / Week ${week}</p><p class="eyebrow">Statistics with Project Skills · Week ${number(week)}</p><h1>${e(title)}</h1><p class="week-overview">${e(weekly.description)}</p><p class="lesson-meta"><span>Classes A, B &amp; C</span><span>90 minutes per class</span><span>Foundation · Business &amp; Science</span></p></div></section>
    <nav class="week-jump-nav" aria-label="Week ${week} sections"><div class="container"><span class="week-jump-label">Jump to</span>${classes.map((item) => `<a href="#class-${item.letter.toLowerCase()}">Class ${item.letter}</a>`).join('')}<a href="#learning-objectives">Learning objectives</a><a class="week-outline-link" href="${routeHref('statistics', `week-${week}`)}">All weeks</a></div></nav>
    <div class="container week-body"><section class="week-shared-resource" aria-labelledby="week-vocabulary-heading"><div><p class="week-kicker">For the whole week</p><h2 id="week-vocabulary-heading">One reference for all three classes</h2><p>${e(weekly.referenceDescription || 'Shared vocabulary and formulas for Classes A, B and C. The reference file will appear here when available.')}</p></div>${resource(weekly.vocabulary, 'Vocabulary & terms', `Week ${week}`)}</section>${sections}
    <section class="week-objectives" id="learning-objectives" aria-labelledby="week-objectives-heading"><p class="week-kicker">Learning objectives</p><h2 id="week-objectives-heading">What you should be able to do</h2><p class="week-objectives-intro">Use these objectives to check your understanding after each class. For example, <strong>${week}B.1</strong> means Week ${week}, Class B, objective 1.</p>${objectives}</section>
    ${tutorial ? `<p class="week-tutorial">Also this week: ${link(`statistics-week-${number(week)}-d`, `Class D · ${e(tutorial.title)}`)}</p>` : ''}
    ${adjacentWeeks(week, 12, 'statistics-week-', (next) => data.lessons.find((item) => item.week === next).weekTitle)}</div>`;
  return { title: `Week ${week} · ${title} · Statistics · Jacob Mlynarski`, description: weekly.description, bodyClass: 'statistics-week-page', styles: [], content };
}

export function renderFinanceWeek(week, data) {
  const item = data.weeks.find((entry) => entry.week === week);
  if (!item) throw new Error('Week unavailable');
  const content = `<section class="course-banner lesson-banner week-banner"><div class="container"><p class="breadcrumbs">${link('home', 'Home')} / ${link('courses', 'Courses')} / ${link('corporate-finance', 'Corporate Finance')} / Week ${week}</p><p class="eyebrow">Corporate Finance · Week ${number(week)}</p><h1>${e(item.title)}</h1><p class="week-overview">${e(item.description)}</p><p class="lesson-meta">${item.meta.map((text) => `<span>${e(text)}</span>`).join('')}</p></div></section>
    <nav class="week-jump-nav" aria-label="Week ${week} sections"><div class="container"><span class="week-jump-label">Jump to</span><a href="#class-content">Class content</a><a href="#learning-objectives">Learning objectives</a><a class="week-outline-link" href="${routeHref('corporate-finance', item.outlineHash)}">Course outline</a></div></nav>
    <div class="container week-body"><section class="week-class" id="class-content" aria-labelledby="class-heading"><div class="week-class-heading"><div><p class="week-kicker">${e(item.meta[0])} <span>${e(item.meta[1])}</span></p><h2 id="class-heading">${e(item.title)}</h2></div><a class="week-objectives-link" href="#learning-objectives">Learning objectives</a></div><div class="week-class-copy"><p class="week-class-description">${e(item.description)}</p><h3>What this class covers</h3><ul class="week-coverage">${item.coverage.map((text) => `<li>${e(text)}</li>`).join('')}</ul></div></section>
    <section class="week-objectives" id="learning-objectives" aria-labelledby="week-objectives-heading"><p class="week-kicker">Learning objectives</p><h2 id="week-objectives-heading">What you should be able to do</h2><p class="week-objectives-intro">Use these objectives to check your understanding after this class.</p><section class="week-objective-group" aria-labelledby="objectives-heading"><div><h3 id="objectives-heading">${e(item.meta[0])}</h3><p>${e(item.title)}</p><a href="#class-content">Back to class</a></div><ol class="week-objectives-list">${item.objectives.map((text, index) => `<li id="objective-${week}-${index + 1}"><span class="week-objective-code">${week}.${index + 1}</span><span>${e(text)}</span></li>`).join('')}</ol></section></section>
    ${adjacentWeeks(week, 16, 'corporate-finance-week-', (next) => data.weeks.find((entry) => entry.week === next).title)}</div>`;
  return { title: `Week ${week} · ${item.title} · Corporate Finance · Jacob Mlynarski`, description: item.description, bodyClass: 'statistics-week-page', styles: [], content };
}

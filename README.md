# Jacob Mlynarski — personal website

A small personal teaching and research website with four main sections: **Home**, **Courses**, **Publications**, and **About Me**. It uses browser JavaScript, one shared HTML shell, and local content files. No build step, package installation, PHP, database or student account system is required.

Work on this project in `D:\OneDrive\GitHub\personal-site`. The independent LMS / Bellerby Centre project is at `D:\OneDrive\Eurasia Teaching Content\website`.

## Run locally

Double-click **Start Personal Website.cmd**, or run:

```text
python scripts/serve.py --no-browser
```

Open `http://127.0.0.1:8766/`. Python 3 is only a local preview convenience; published static hosting does not run Python. Keep the server console open while using it. Refresh after editing. The Centre / LMS preview uses its separate port, 8765.

## Structure and editing

- `index.html`: the single shared header, navigation, page container and footer.
- `assets/app.js`: page loading, navigation, browser history, per-page styles and practice initialization.
- `assets/site-core.mjs`: route validation, links and navigation helpers.
- `assets/page-templates.mjs`: reusable Statistics and Finance weekly layouts.
- `content/pages.json`: content, titles, descriptions and scoped styles for the four main sections, course outlines, practice introduction and four tutorials. Content is trusted HTML markup without repeated headers or footers.
- `content/statistics.json`: all 40 Statistics classes, coverage, objectives, resource paths and weekly introductions. Edit this data to update a lesson; no HTML generation is needed.
- `content/corporate-finance.json`: the 16 Finance weeks, descriptions, coverage, objectives and outline anchors.
- `content/statistics-question-bank.json`: the 649 existing practice questions for Weeks 1–4.
- `assets/preview.css` and the other scoped stylesheets: the existing visual design.
- `materials/`: the original course downloads, preserved byte-for-byte.
- `content/legacy-routes.json`: mappings for all 76 former HTML addresses.
- `404.html`: a small static-host compatibility helper for old bookmarks; it is not a second page layout.

There are **two HTML files and 40 content views**, rather than 76 HTML files. Statistics uses 12 weekly views combining Classes A/B/C plus four tutorials. Finance uses 16 weekly views. All share the same site shell.

## Links and navigation

Examples:

```text
index.html?page=about-me
index.html?page=statistics
index.html?page=statistics-week-01#class-a
index.html?page=statistics-practice&objective=1A.3
index.html?page=corporate-finance-week-16
```

Query-based links work on direct visits, refreshes and static hosting under a subdirectory such as `/personal-site/`, without server rewrite rules. Back/Forward, class jump links, expandable publication abstracts and citations remain supported. JavaScript is required for site content. Failed content requests show a retry action instead of an endless reload.

The local preview redirects former `.html` addresses using the route map. GitHub Pages can use `404.html` to send those bookmarks to the matching new view. Unknown addresses show a not-found page. The old HTML files and Python page generators are retained in Git history, not in the working project.

## Practice

The existing Statistics practice runs entirely in the browser, with learning objectives grouped by week, week-wide select-all, difficulty and style filters, mixed practice, numeric and choice marking, hints, worked solutions, fullscreen mode and session results. Session answers remain in memory when navigating within the site and reset on refresh. There is no backend submission or persistent grade database. Students select learning objectives rather than individual questions; the site automatically chooses a deduplicated set of questions that assess the selected objectives. Changing filters preserves the selected objectives.

Additional subjects can have their own question banks and browser practice modules without creating per-question or per-lesson HTML files. New subject questions are not included in this conversion.

Run checks with Node.js:

```text
node --test tests/site.test.mjs tests/statistics-practice.test.mjs tests/statistics-question-bank.test.mjs
```

## GitHub and hosting

The public source repository is `https://github.com/MrBytor/personal-site`. It is independent of `MrBytor/projects`; changes here do not update that repository or the Centre / LMS workspace. Uploading source does not automatically enable website hosting.

The site is compatible with GitHub Pages and other static hosts: publish this folder as-is, with `index.html` at its root and `.nojekyll` preserved. PHP hosting is not required. The source repository is public; this structure does not hide browser code or downloadable materials.

## Theme and font licences

The existing design was adapted from the purchased WP-Academic 2.4.3 theme, using its supplied CSS and Bootstrap. Theme assets remain subject to the purchased theme's applicable licence; this repository is not a theme redistribution package.

Local Karla and Montserrat fonts use the SIL Open Font License. Their licence files remain in `assets/fonts/`.

## Photo credits

Photos used under the [Unsplash License](https://unsplash.com/license): [Zoshua Colah — library](https://unsplash.com/photos/Of-W1y-rLoQ), [Carlos Muza — statistics](https://unsplash.com/photos/hpjSkU2UYSU), and [Kelly Sikkema — finance](https://unsplash.com/photos/_1QHMYHNeN0).

Publication metadata comes from supplied CV context and public publisher/university records. The Sustainability paper is indexed under the publisher’s 2023 volume (published online in 2022). No example-template publications are attributed to Jacob.

## Publication and contact updates

All four abstract panels contain the original full abstracts from publisher or author-provided versions. Publisher, DOI (where assigned), Abstract and BibTeX controls share one row; expandable text appears below. Panel toggles and citation copying use delegated events so they continue to work after client navigation.

The current Springer citation for “Outsiders within” records publication on 13 August 2026, but does not yet assign volume, issue or pages; these are deliberately omitted from the displayed citation and BibTeX. Higher Education Forum volume 23, pages 183–208 includes DOI `10.15027/0002041831`.

Journal impact factors are taken from the publisher’s 2025 figures. SJR quartiles for Higher Education and Higher Education Forum are reproduced by Research Journal Rank and cross-checked against other journal records. Sustainability’s JCR and Scopus CiteScore classifications come from MDPI. Each journal uses one subdued line for impact factor (where verified), one quartile and Scopus indexing. The year stays visible; the classification category is available in a tooltip. The metric labels link directly to their publisher or quartile source; no separate source disclosure is shown. The additional Sustainability CiteScore classification is omitted from the publication listing. A JCR impact factor is not supplied for Higher Education Forum because no official value was verified; journal indicators do not apply to the book chapter.

The About Me introduction uses the first person. Contact information follows the supplied CV. LinkedIn `jacobmlynarski` and ResearchGate `Jacob-Mlynarski-3` match the name, university and published work. The social SVG glyphs come from [Simple Icons](https://github.com/simple-icons/simple-icons), distributed under CC0; brand rights remain with their respective owners.

The About Me sidebar presents Email and its address on one row, followed by Phone and its number on a second row. Its portrait retains its original size, and the profile container is slightly wider so the sidebar sits farther left. The labels and values stay aligned in two columns on smaller screens; long email addresses can wrap within the value column.

## Course content status

Existing pending and under-revision resource labels remain in the content. This conversion changes how pages are rendered; it does not supply unfinished teaching materials. Statistics objectives for Weeks 5–12 should continue to be reviewed alongside final teaching materials.

Project Management course and catalogue photo: [airfocus — project planning](https://unsplash.com/photos/people-collaborating-on-project-plan-v89zhr0iBFY), used under the Unsplash License.

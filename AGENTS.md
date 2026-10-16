# Personal website scope

This folder is Jacob Mlynarski's independent static personal website. Apply personal-site changes here.

- Keep the four main sections: Home, Courses, Publications and About Me, unless Jacob asks to change them.
- Preserve the existing visual design and personal branding; professional affiliations in the biography are factual content.
- Keep all site assets, course downloads and runtime data references within this project. Do not link to files in the source copy or LMS workspace.
- The LMS / Bellerby Centre project is separate at `D:\OneDrive\Eurasia Teaching Content\website`. Do not edit or synchronize it as part of personal-site work unless explicitly requested.
- The original `D:\OneDrive\GitHub\projects` repository is also separate. This project's public GitHub repository is `MrBytor/personal-site`; its `origin` remote is for source backups and updates. Website hosting is not configured.
- Preview with `python scripts/serve.py --no-browser` (default port 8766; LMS uses 8765). No build or package installation is needed.
- This is a browser JavaScript site with one shared shell, `index.html`. Do not generate separate HTML files for lessons or sections. `404.html` is only a legacy-bookmark helper for static hosting.
- Main section and tutorial content is in `content/pages.json`. Statistics curriculum is in `content/statistics.json`, Finance weeks in `content/corporate-finance.json`, and the practice bank in `content/statistics-question-bank.json`.
- Navigation is in `assets/app.js` and `assets/site-core.mjs`; reusable weekly layouts are in `assets/page-templates.mjs`. Shared design remains in `assets/preview.css` and the scoped subject/profile stylesheets.
- Use query routes such as `index.html?page=statistics-week-01#class-a`. Preserve objective filters and anchor IDs. `content/legacy-routes.json` maps old bookmarks; the local preview server and static-host 404 helper use it.
- Existing quizzes run in the browser. Keep student accounts, grades and backend connections outside this project unless explicitly requested. No CMS, framework installation or PHP is required.
- Run `node --test tests/site.test.mjs tests/statistics-practice.test.mjs tests/statistics-question-bank.test.mjs` after functional changes. Verify navigation, direct/reloaded routes, mobile menu, old links, downloads and practice in a browser when applicable.
- Preserve font licences and image/theme attribution in README.md.

# Personal website scope

This folder is Jacob Mlynarski's independent static personal website. Apply personal-site changes here.

- Keep the four main sections: Home, Courses, Publications and About Me, unless Jacob asks to change them.
- Preserve the existing visual design and personal branding; professional affiliations in the biography are factual content.
- Keep all site assets, course downloads and runtime data references within this project. Do not link to files in the source copy or LMS workspace.
- The LMS / Bellerby Centre project is separate at `D:\OneDrive\Eurasia Teaching Content\website`. Do not edit or synchronize it as part of personal-site work unless explicitly requested.
- The original `D:\OneDrive\GitHub\projects` repository is also separate. This project's public GitHub repository is `MrBytor/personal-site`; its `origin` remote is for source backups and updates. Website hosting is not configured.
- Preview with `python scripts/serve.py --no-browser` (default port 8766; LMS uses 8765). No build or package installation is needed.
- HTML is edited directly. Shared styles are in `assets/preview.css`; client navigation is in `assets/preview.js`. The statistics builder derives the common shell from `statistics.html`.
- Preserve font licences and image/theme attribution in README.md.

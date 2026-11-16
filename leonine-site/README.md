# LEONINE (V3.1)

Black "darkroom" photography site. Static, no build step. Open `index.html` to preview.

## Projects (the main thing you will edit)
All photos are organised in `js/projects.js` (instructions at the top).
1. Put a project's photos in their own folder, e.g. `images/lisbon/`.
2. Add a project block in `js/projects.js`. `status: "current"` is shown first, `"archive"` projects are listed under Archive automatically.
3. Commit.

## Other
- Landing video wall: set `HERO_CLIPS` in `js/main.js` (silent clips, put files in `video/`).
- About: in `index.html` remove `hidden` from the About section, write the text, and remove the same `!$("#about").hidden` check is automatic.
- Contact form: Netlify Forms, form name `booking`.

## Changelog
- V3.1 Projects system, movies removed, text cleared, video wall slot.

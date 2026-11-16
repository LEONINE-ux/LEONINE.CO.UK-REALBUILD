/* ============================================================
   LEONINE : PROJECTS
   Edit this file to add or change projects. Nothing else needs touching.

   HOW TO ADD A PROJECT
   1. Put the photos in a new folder, e.g.  images/lisbon/
      (JPEGs, about 1600px on the long edge).
   2. Copy one project block below, paste it above the others, and change it.
   3. Each photo is  { f: "file-name.jpg" }  . Order here is the order on the site.
      Width and height (w, h) are optional.

   Optional per project: tagline, era (or year), place, note (a short text shown after the last photo).

   A photo can also carry a side note, shown beside it: add  label: "...", note: "..."  to that photo's line.

   A project with no photos yet shows as an in-progress brief (subject, timeline, places, why),
   with the latest finished project shown in full underneath.

   status: "current"  -> the project shown first, in full, on the home page.
           "archive"  -> listed under Archive; opens when clicked.
   Only ONE project should be "current".
   ============================================================ */
window.PROJECTS = [
  {
    id: "arris-cant",
    title: "Arris Cant",
    tagline: "Imposing and grand architecture",
    state: "In progress",
    ends: "31/12/2027",
    status: "current",
    brief: {
      subject: "Architecture, specifically imposing and grand buildings in the brutalist style.",
      timeline: "Ends 31 December 2027.",
      places: ["Brutalist landmarks"],
      why: "This builds into my next field of inspiration. It develops my photography in a way that excites me and lets me experiment with a whole new world of photography."
    },
    photos: []                 // add photos here when you have them
  },
  {
    id: "nascence",            // used in the web address, no spaces
    title: "Nascence",
    tagline: "Finding my style",
    era: "pre NOV26",          // shown as "Era: pre NOV26". Or use year / place instead.
    status: "archive",
    note: "Selected from hundreds upon hundreds of frames, these are the ones that meant the most to me and began to define my style in photography, transforming what I shoot from basic family holiday photos into meaningful pieces of art.",
    folder: "images/photos/",  // where this project's photos live
    photos: [
    { f: "01.jpg", w: 971, h: 1600 },
    { f: "02.jpg", w: 1600, h: 1093 },
    { f: "03.jpg", w: 1600, h: 1272 },
    { f: "04.jpg", label: "The whole collection", note: "All of this first collection was shot in France and Belgium. I only wanted to spend money on film while I was on holiday, so every frame here comes from those trips.", w: 1089, h: 1600 },
    { f: "05.jpg", w: 1119, h: 1600 },
    { f: "06.jpg", w: 1069, h: 1600 },
    { f: "07.jpg", w: 1081, h: 1600 },
    { f: "08.jpg", w: 1600, h: 1085 },
    ]
  }

  /* EXAMPLE of a second project (remove the slashes to use it):
  ,{
    id: "lisbon",
    title: "Lisbon",
    status: "archive",
    year: "2026",
    place: "Portugal",
    folder: "images/lisbon/",
    photos: [
      { f: "01.jpg" },
      { f: "02.jpg" }
    ]
  }
  */
];

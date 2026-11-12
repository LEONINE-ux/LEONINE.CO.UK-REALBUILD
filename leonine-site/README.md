# LEONINE (V1.0)

Static site: no build step. Open `index.html` to preview.

## Structure
- `index.html` page content
- `css/style.css` styling
- `js/main.js` photo viewer, film player, enquiry form
- `images/photos/` gallery photos (01.jpg, 02.jpg ...)
- `images/banner.jpg` top banner

## Add a photo
1. Save it in `images/photos/` (about 2000px on the long edge, JPEG).
2. Copy one `<button class="ph pm">...</button>` line in `index.html` (inside `id="pgrid"`), change the file name, width and height.

## Add the film
Put the file in a `video/` folder, then in `js/main.js` set `const CLIPS = ["video/film.mp4"];`

## Booking form
Uses Netlify Forms. After the first deploy: Netlify > Forms > booking > Settings & usage > Form notifications > add an email notification.

## Orders
There is no shop. Prints, music and bookings are requested through the Enquire form and handled by email.

## Changelog
- V1.0 First public version: photo gallery, movies section (clips to come), private enquiry form, legal page, no shop.

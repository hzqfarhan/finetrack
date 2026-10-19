# FineTrack Duo presentation

A Next.js website with a Three.js product illustration, six presentation chapters, animated transitions, and speaking cues for two presenters (9 minutes suggested).

## Run

Install Node.js 22 or newer. In this folder run `npm install`, then `npm run dev`. Open http://localhost:3000. For a static production export run `npm run build`; the website is generated in `out/` and must be served over HTTP, not opened as a file. All visual assets are bundled locally.

## Present

- Right / left arrows, PageDown / PageUp, or Space navigate chapters. Buttons also work with a mouse or touchscreen.
- F toggles fullscreen; N toggles speaking cues. Cues are visible on the shared screen, so hide them for audience delivery.
- Drag the model to rotate, scroll to zoom, and select parts to highlight or reorient it.
- The sound demo is a synthetic illustration, not the actual product sound.
- The custom 3D reconstruction is based on official photography, not official CAD or exact dimensions. The internal view is a simplified reconstruction of the supplied teardown photos.

Content source: https://www.ugreen.com/en-au/products/au-75646p (reviewed 4 October 2026). Product image belongs to UGREEN and is used as a fallback for this educational presentation. Product claims are manufacturer claims. No local price was supplied, so no price is invented.

The supplied assessment requires a pair presentation lasting 8–10 minutes, lecturer approval of the product, and bringing the real device. This website is a visual aid, not a replacement for those requirements. Rehearse and expand the cues in your own words.

Geometry revision: matched the square outer frame, inset triangular corner opening, and smaller button bezel to the official UGREEN gallery, especially 613l_fKG41L.jpg (front view) and 61UTE_qLETL.jpg (charging close-up). Proportions are photograph-derived, not measured CAD. Source: https://www.ugreen.com/en-au/products/au-75646p . Graphite follows the reference; Pearl, Blue and Green are illustrative colour previews, not confirmed retail variants.

## Refined experience

- Responsive presentation layout for desktop, tablet and mobile.
- Light/dark themes, saved on this browser. Light theme uses the #007934 Brand Green found in UGREEN's official site; dark mode uses a brighter accessible green against charcoal.
- Product story and Inside the tracker views use URL hashes (#presentation and #inside), including browser Back navigation.
- Inside view includes smoothly separated cover, battery, circuit board, antenna and sounder/rear shell. Assemble button and separation slider control the animation. Select the component list or visible model parts for descriptions and speaking cues.
- Internal arrangement is a simplified educational model, not exact Duo CAD or a repair guide. No unverified chip model or battery capacity is claimed.
- Colour choices remain illustrative except the reference Graphite appearance.

Research references:
- Official branding and product: https://www.ugreen.com/ and https://www.ugreen.com/en-au/products/au-75646p
- Related CM916 regulatory exhibit: https://fccid.io/2AQI5CM916/Internal-Photos/Internal-Photos-8667247
- First-hand related FineTrack G teardown (not the exact Duo): https://goughlui.com/2026/03/15/teardown-ugreen-finetrack-g-item-finder-for-google-find-hub-cm916-65543p/


## October 11 updates

- Slow continuous LED demonstration blink, steady when reduced motion is requested.
- Six smoothly animated chapter poses, subtle floating motion, and larger product framing. Mobile chapter buttons return to the model.
- Teardown revised using the supplied images: round CR2032 3V coin cell, stamped metal holder, blue PCB and foam strip. The linked Duo is USB-C rechargeable; the internal view explicitly identifies the different photo-reference battery configuration. Hidden parts remain illustrative.


## Model-first showcase

The story now has 16 slides: introduction, definition, four-model colour lineup, four individual finishes, parts, covered USB-C port, open charging port, keyring attachment, backpack attachment, luggage attachment, operation, benefits and conclusion. The lineup expands into a 2-by-2 arrangement on phones. Colour buttons on the lineup advance to each finish's slide. Graphite is the reference; other colours are illustrative concepts. Accessories are custom 3D teaching illustrations with the tracker enlarged for visibility. The bottom dust plug sits almost flush by default and pulls straight out in the charging scene. No waterproof rating is implied. Rehearse the expanded sequence within the assignment's time limit.


## Equal split and 3D finding demonstration

The latest presentation has 18 slides. Desktop uses equal-width explanation and model panels, with a centered slide number and progress indicator beneath them. Phones stack those panels. Slide 9 presents the disassembled photo-reference assembly with component selection, an assembly button and separation slider. Slide 16 contains a fully code-built Three.js room, furniture, human character, phone, keys and tracker. Playback shows the sound source, slowed illustrative sound waves and a walking character. There are no generated lifestyle images in the website.

Upload a local audio file in the demo to use your tracker recording (up to 30 MB; browser-supported audio such as MP3/WAV). It stays in browser memory for this session and is not uploaded to a server. Playback can be muted, and navigation stops the audio. Until a recording is provided, this demo runs visually without fabricated product audio. Sound-wave travel and scene dimensions are illustrative, not an acoustic measurement. The bag and luggage proportions now show a small tracker rather than an enlarged tag. Exact Duo dimensions remain unverified.

Port correction: replaced the hinged flap with a thin, phone-button-like rubber lip and push-in stem, following the user’s clarification. The charging transition translates the plug outward without rotating it.


## Full-width hero presentation (current layout)

The latest version has 19 slides. Full-width hero scenes replace the equal split and boxed components. Headings and explanations sit above the large models. The footer contains only Previous/Next, the current slide title and page number. The designed introduction leads to a QR on slide 2, encoding exactly `https://ugreen.hyun.my`. The QR was decoded from both its source PNG and its browser-rendered screenshot. That domain did not resolve during the latest check; the QR needs the intended site to be hosted at that address before classroom use. No domain or DNS configuration was modified.

The layers slide and fully 3D room demo remain available in sequence. The room’s recording controls are under “Demo steps & sound recording”. The colour swatches advance to the corresponding finish slide. Keyboard arrows/Space, speaking cues (N), and fullscreen (F) remain available.

The Port covered slide uses an orthographic front close-up centered on the inserted dust plug. Casing materials fade while the plug remains opaque. Rotation is locked for this detail; the next slide restores normal materials and camera controls.


## October 11 presentation refinements
- 24 slides with viewport-anchored footer, scrollable long copy, and responsive 3D stage.
- Space advances the room demonstration one step per press; each step holds until the next press. After Found it, Space restarts. Arrows still change slides. Sound upload remains local.
- Casing slide: confirmed plastic; explains general low-weight, insulation and mouldability benefits without claiming an unverified resin or impact rating.
- Battery slide: USB-C rechargeable, up to one year per charge (manufacturer claim; actual life varies). No unverified capacity or charging time. The CR2032 teardown remains explicitly distinguished from the rechargeable Duo.
- iOS and Android 3D phone scenes: Connect tracker animates the wireless link and changes the illustrative screen status. One finding network at a time.
- Interactive 3D sample map: Keys/Bag controls change the marker and phone location card. Locations are fictitious, not live GPS.
- Official app artwork: Apple Find My from https://apps.apple.com/us/app/find-my/id1514844621 and Google Find Hub from https://play.google.com/store/apps/details?id=com.google.android.apps.adm . App artwork belongs to the respective owners.
- Product source: https://www.ugreen.com/en-au/products/au-75646p . Workflow sources: https://www.apple.com/icloud/find-my/ and https://www.android.com/intl/en_uk/learn-find-hub/ .
- Checked all 24 slides at 1440×900, 1280×720 and 390×844: fixed footer position, no horizontal overflow, no browser exceptions. Space start/pause verified at each size.


QR destination updated to https://ugreen.seladevs.my. Source PNG decoded and verified; displayed URL and link match. Earlier domain checks above are historical.


The finding demo now contains 16 manually advanced story moments across home/keys, café/bag, and terminal/luggage scenarios. Space advances or restarts; Previous moment and scenario shortcuts support rehearsal. Animated camera framing can be overridden by dragging. Phone and sample map inserts accompany written dialogue; no synthetic speech is played. Uploaded tracker audio plays only during sound-search moments. Reduced motion skips camera interpolation and walking animation. All 16 steps and manual hold were browser-checked without page errors.


Latest environment update: keys use a home entryway with console table and door; bag uses a café with service counter, coffee machine and separate seating; luggage uses a glass-walled airport baggage claim with carousel, seats and kiosk. All map views now use a flat SVG illustration with location card and zoom control, including the dedicated map slide and story inserts. Map locations are fictional examples.


The iOS and Android connection slides, plus the demo app insert, now use responsive 2D HTML/SVG visualizations with official app icons. The Connect tracker interaction updates the status and connection dots; these views no longer render a 3D canvas.


Ending update: 25 slides. Space or Next slide at the final luggage moment continues to the next presentation slide; Reset remains available in demo details. The final Thank you slide credits hzqfarhan with a CSS 3D tilt card linking to https://github.com/hzqfarhan. Reduced motion disables tilt. Verified demo exit, link destination, and desktop/mobile layouts.


Demo navigation update: the main footer Next button advances each of the 16 finding-demo moments, then continues to slide 23. Separate demo advance buttons and Space prompts have been removed. Right arrow, PageDown and Space use the same forward action.


## Phone remote

The phone remote supports swipe/Next/Previous navigation, demo moments, confetti, curtain, spotlight and blank-screen controls. It uses Supabase HTTPS polling (no WebSocket) and the ETC_ database namespace. See [REMOTE-SETUP.md](REMOTE-SETUP.md) for Vercel and etcremote.seladevs.my setup. Add your public settings from .env.example and run supabase/ETC_remote.sql before pairing.

# Adinan's Engagement

Invitation website for the engagement of **Adinan AV**: Wednesday, 30 December 2026, 5:00 PM, at CIAL Golf Course, Nedumbassery, Kochi.
With love, Abdul Vahab & Najeema K.

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | The invitation: name written on in gold, the letter, date/time/venue, live countdown, blessing and sign-off |
| `evening.html` | The date set large, a clock whose hands sweep to 5:00 as you scroll, a setting sun, calendar buttons |
| `venue.html` | A route line that draws itself as you scroll, address with copy button, Google/Apple Maps, how to get there |
| `rsvp.html` | A reply form that writes a WhatsApp message for guests to send to the family |

## Scroll animations

All in `js/main.js`, with no libraries:

- `data-reveal` (`left`, `right`, `zoom`, `blur`) fades elements in as they enter the screen; `--d` sets a stagger delay
- `data-parallax` moves the leaves and big numbers with the scroll
- `data-draw` draws SVG lines (ornaments, the vine, the venue route) in step with the scroll
- a gold progress bar, a nav bar that turns solid after scrolling, and a dusk tint on The Evening page

Everything respects the visitor's "reduce motion" setting, and the content stays visible without JavaScript.

## Settings

- **RSVP WhatsApp number:** set `HOST_WHATSAPP` at the top of `js/main.js` (country code plus digits, e.g. `919876543210`). Left empty, WhatsApp asks the guest which chat to send to.
- **Event time:** `EVENT_START` / `EVENT_END` in `js/main.js` drive the countdown. The calendar links in `evening.html` and `adinan-engagement.ics` use the same times.

## Run locally

It's a static site. Open `index.html`, or serve the folder:

```sh
npx serve .
```

## Deploy

Any static host works: GitHub Pages (Settings → Pages → deploy from `main`, root folder), Netlify, or Vercel (import the repo, no build step).

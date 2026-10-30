# Decision Log

Format: `D-NNN — date — decision` · rationale · source.

## D-001 — 2026-10-30 — Client-only app, no backend
All data lives in the browser. Source: user.

## D-002 — 2026-10-30 — Persist in `localStorage`
Survives tab and browser restarts. JSON import/export serves as the backup and transfer path. Source: user (chose this over sessionStorage).

## D-003 — 2026-10-30 — PDF is a replica of the ICAO/ANAC FPL form
The PDF reproduces the bilingual (EN/ES) ICAO model form as published in AIP SUP A 94/2024 (ENR 1.10, Apéndice 1). That form has no national fields beyond a free "Espacio reservado para requisitos adicionales" box and the PIC signature line. Source: user + SUP research.

## D-004 — 2026-10-30 — Single static HTML, no build step
Built from `index.html` and vanilla JS, with jsPDF from a pinned CDN URL. It can be opened from file:// or any static host. Source: user.

## D-005 — 2026-10-30 — UI in Spanish with an English toggle
The PDF labels stay bilingual whatever the UI language is, as on the official form. Source: user.

## D-006 — 2026-10-30 — Normative reference
AIP SUP A 94/2024 (ANAC, 31-Jul-2024) replaces AIP Vol I ENR 1.10. It is aligned with Doc 4444 Appendix 2 and has no national Item 18 indicators. Rules taken from it:
- Item 7: max 7 chars, no hyphens (LVGVE).
- Items 7–18 and 19 are completed.
- Times are 4-digit UTC.
- Item 18 is `0` when empty, with indicators in the Doc 4444 order.
- Item 19 is not transmitted.
Source: https://ais.anac.gob.ar/descarga/sup-66aa4470bad17

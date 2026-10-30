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

## D-007 — 2026-10-30 — Saved entities: planes, pilots, flight drafts
All three are stored in localStorage and included in import/export. Source: user.

## D-008 — 2026-10-30 — "Full" plane profile
A plane stores:
- registration (Item 7) and type
- wake category
- Item 10a and 10b
- PBN/NAV/COM/SUR/DAT/CODE/SEL
- cruise speed
- endurance
- Item 19 R/, S/, J/, D/
- colour and markings
- operator (OPR/)
- notes
These prefill the flight form. Source: user.

## D-009 — 2026-10-30 — Validation blocks PDF generation
Errors are shown inline, and the PDF button stays disabled until all errors are cleared. Source: user.

## D-010 — 2026-10-30 — Bundled aerodrome list, suggestive only
The list holds ICAO codes and national 3-letter codes (e.g. FDO ↔ SADF San Fernando), with codes taken from the ANAC AIC. It is used only for autocomplete and hints, and any value is accepted. Local 3-letter codes are legitimate in Items 13 and 16 and in RALT/TALT (SUP A 94/2024 §Casilla 13/16), so they are not rewritten to ZZZZ. ZZZZ plus DEP/DEST/ALTN is still supported for places that have no code. Source: user + SUP.

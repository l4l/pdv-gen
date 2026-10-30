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

## D-011 — 2026-10-30 — UX: friendly by default, uncluttered for pros
- Main flow is plane → pilot → flight → PDF, using the form's box numbers (7, 8, 9…) as anchors that pros already know.
- Plane and pilot profiles prefill the form, so a routine flight only needs aerodromes, times, route, EET and POB.
- Advanced fields (Item 18 extras, Item 19 survival/dinghies, ZZZZ details) sit in collapsible sections. They expand automatically when filled or when they have an error.
- Short inline hints and examples are shown, with fuller help on demand (ⓘ) and not always visible.
- A live preview of the ICAO FPL text sits beside the form for pros to check at a glance.
- Codes are uppercased automatically, with keyboard-first input.
Source: user.

## D-012 — 2026-10-30 — A4 layout redrawn from SUP A 94/2024, with jsPDF
The form is drawn as vectors with jsPDF from a pinned cdnjs URL, laid out like the official form in SUP A 94/2024 (p.8). It does not overlay a scanned template, because no official fillable PDF exists and the EANA paper pads are A4 ICAO model. Labels are bilingual and copied verbatim, sic typos included ("ADRESSE(S)", "ADDOTIONAL"), so the form is recognisable. The grey COM block is left empty for ARO. Source: research.

## D-013 — 2026-10-30 — Optional drawn PIC signature
The signature is drawn on a canvas and stored with the pilot profile as a PNG data URL. It is stamped into the "Firma del Comandante" area, which supports email filing (AIC A 19/2026: signed PDF to ARO/AIS). If there is no signature, the line is left blank. Source: user.

## D-014 — 2026-10-30 — No phone/license/DNI on the form
These are not official boxes. They are left out of the form and are not added to RMK/. Source: user.

## D-015 — 2026-10-30 — ARO/AIS directory as post-generation hint
The ARO/AIS office emails and phones from AIC A 19/2026 Anexo ALFA are bundled. After generation the app shows:
- the departure office's email and phone
- the suggested subject (Item 7)
- a "call to confirm acceptance" reminder
Nothing is sent from the app. Source: user.

## D-016 — 2026-10-30 — Curated GA aircraft type list
About 100 common Argentine GA Doc 8643 designators with wake category are used for autocomplete. Free entry is still accepted, and ZZZZ requires TYP/. Note: AB-115 = AB11, AB-180 = AB18, PA-28 variants = P28A/P28B/P28R. Source: user + ICAO Doc 8643.

## D-017 — 2026-10-30 — Validation rules (blocking)
Rules come from SUP A 94/2024 and PROGEN-ARO (Res. ANAC 35/2025):
- Item 7: ≤7 alphanumerics.
- Item 8 rules: I/V/Y/Z. Type: S/N/G/M/X.
- If Item 7 is a registration, type of flight is G/M/N/X and OPR/ is required.
- Item 9: 2–4 characters. ZZZZ requires TYP/. Wake: L/M/H/J.
- Item 10a/10b: valid codes. R requires PBN/; Z requires NAV/, COM/ or DAT/.
- Item 13/16: times HHMM.
- ZZZZ requires DEP/, DEST/ or ALTN/.
- Speed: K/N 4 digits or M 3 digits. Level: F/A 3 digits, S/M 4 digits, or VFR.
- Y/Z requires a rule-change point in the route.
- E/ (endurance) must be greater than EET.
- DOF/: YYMMDD.
- PBN/: ≤8 codes.
- If DOF is not today, DOF/ is included automatically.
- Uppercase is applied automatically.
Source: research.

## D-018 — 2026-10-30 — DOF/ always included
DOF/ is always derived from the flight date, which defaults to today in UTC. PROGEN-ARO requires it for plans filed in advance, and it is harmless otherwise. This supersedes the "only when not today" note in D-017. Source: research.

## D-019 — 2026-10-30 — Transmitted text is normalised
Items 7–18 are uppercased, accents are stripped (Á→A, Ñ→N), and runs of spaces are collapsed. Free-text Item 18 values reject `- ( ) /`, which are FPL message delimiters. Item 19 text is also uppercased. Source: Doc 4444 message format.

## D-020 — 2026-10-30 — PDF ink and spacing deviations
Filled values are drawn in dark blue so they stand out from the printed form. The route, Item 18 and footer strips are slightly taller than the scan, so text and a signature fit legibly on A4. Source: implementation.

## D-021 — 2026-10-30 — Deployment
`python3 -m http.server 9991 --bind <tailscale IPv4>` serves the repo root as static files. No build is needed. Source: user.

## D-022 — 2026-10-30 — Item 10 multi-select picker
Item 10 codes come from a fixed list but combine (SDFGY), so a single-select dropdown cannot express them. Each Item 10 input therefore keeps its text box for pros, plus a ▾ checkbox grid where every code has a short description. The grid enforces two rules: N stands alone, and 10b allows only one transponder mode (A/C/E/H/I/L/P/S/X). It writes codes in canonical order. Source: user.

## D-023 — 2026-10-30 — DOF/ omitted for same-day flights
This supersedes D-018. The user asked for DOF/ to be removed. PROGEN-ARO still requires DOF/ when a plan is filed ahead for a later date, so DOF/ is now included only when the flight date (UTC) is not today. Source: user + PROGEN-ARO.

## D-024 — 2026-10-30 — No credit line on the PDF; layout frozen
The "Generado con PDV-Gen…" footer is removed. The blue ink and the current proportions (D-020) are kept as-is per the user, with no change toward a strict replica. Source: user.

## D-025 — 2026-10-30 — PIC always follows the selected pilot
If a pilot is selected and the PIC field is empty (for example after an import or an old saved flight), the PIC and "Presentado por" fields are filled in from the pilot. When there is exactly one pilot, they are selected automatically. Source: user report "pic not filled".

## D-026 — 2026-10-30 — Hosting on GitHub Pages
The site is pushed to github.com/l4l/pdv-gen and served by GitHub Pages from the `gh-pages` branch. A workflow mirrors `main` into that branch on every push, and the site is the repo root as static files with no build. The Tailscale host stays available for local use. Source: user.

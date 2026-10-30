# PDV-Gen

A generator for ICAO flight plans (Plan de Vuelo) in the format ANAC Argentina expects (AIP SUP A 94/2024, ENR 1.10). It is a static page and everything stays in the browser (localStorage).

- Saved **aircraft** and **pilots** fill in the form for you. Signatures are optional and drawn on screen.
- Validation follows SUP A 94/2024 and PROGEN-ARO, and the PDF is blocked while any errors remain.
- The PDF is an A4 copy of the official bilingual form, and a live FPL message preview is shown.
- JSON **import/export** covers aircraft, pilots and saved flights.
- Hints for the ARO/AIS office (email and phone, from AIC A 19/2026) and autocomplete for aerodromes (ANAC MADHEL) and aircraft types.

## Run

```sh
python3 -m http.server 9991 --bind "$(tailscale ip -4)"
```

Opening `index.html` directly also works. Hosted at https://l4l.github.io/pdv-gen/ (`gh-pages`, mirrored from `main` by `.github/workflows/pages.yml`). jsPDF is loaded from cdnjs.

## Test

```sh
node test/fpl.test.js        # validation / composition
# test/pdf-sample.html       # visual PDF check in a browser
```

Data sources are listed in the headers of `data/*.js`.

(function () {
  'use strict';

  const FORM_X = 10;
  const FORM_Y = 7.6;
  const FORM_W = 190;
  const EOL_CELL_X = 167.2;

  const H = {
    header: 7,
    com: 35,
    items: 64.5,
    routeLines: [6, 6, 6, 7],
    item16: 19,
    item18Head: 6,
    item18Lines: [5.5, 6, 6, 6.5],
    gap: 3.3,
    supp: 7,
    item19: 72.5,
    footer: 18,
  };
  const ITEM18_LEFT_CELL = 9.2;

  const GREY = 228;
  const INK = [0, 0, 0];
  const FILL_INK = [10, 30, 110];
  const LINE_W = 0.25;
  const FILL_FONT = 'courier';
  const FILL_STYLE = 'bold';
  const FILL_SIZE = 11;
  const FREE_SIZE = 10;
  const MIN_SIZE = 5.5;
  const TICK = 0.22;
  const PT = 25.4 / 72;

  const fx = (x) => FORM_X + x;

  function setInk(doc, rgb) {
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  }

  function font(doc, family, style, size) {
    doc.setFont(family, style);
    doc.setFontSize(size);
  }

  function text(doc, str, x, y, opts) {
    doc.text(String(str), fx(x), y, opts || {});
  }

  function hline(doc, x1, x2, y, w) {
    doc.setLineWidth(w || LINE_W);
    doc.line(fx(x1), y, fx(x2), y);
  }

  function band(doc, y, h, grey) {
    doc.setFillColor(grey ? GREY : 255);
    doc.setDrawColor(0);
    doc.setLineWidth(LINE_W);
    doc.rect(fx(0), y, FORM_W, h, 'FD');
  }

  function box(doc, x, y, w, h) {
    doc.setFillColor(255);
    doc.setDrawColor(0);
    doc.setLineWidth(LINE_W);
    doc.rect(fx(x), y, w, h, 'FD');
  }

  function dash(doc, x, y, len) {
    doc.setDrawColor(0);
    hline(doc, x, x + (len || 3), y, 0.35);
  }

  function arrow(doc, x1, x2, y) {
    const head = 1.8, half = 0.7;
    doc.setDrawColor(0);
    doc.setFillColor(0);
    hline(doc, x1, x2 - head + 0.1, y, 0.35);
    doc.triangle(fx(x2), y, fx(x2 - head), y - half, fx(x2 - head), y + half, 'F');
  }

  function ident(doc, x, yc, w, gap) {
    doc.setDrawColor(0);
    for (let i = -1; i <= 1; i++) hline(doc, x, x + w, yc + i * gap, 0.3);
  }

  function eol(doc, x, baseline, prefix, suffix) {
    const size = 11;
    font(doc, 'helvetica', 'bold', size);
    doc.setTextColor(0);
    const lead = (prefix || '') + '<<';
    text(doc, lead, x, baseline);
    let cx = x + doc.getTextWidth(lead) + 0.2;
    const w = size * PT * 0.62;
    ident(doc, cx, baseline - size * PT * 0.36, w, size * PT * 0.17);
    cx += w;
    if (suffix) {
      text(doc, suffix, cx, baseline);
      cx += doc.getTextWidth(suffix);
    }
    return cx;
  }

  function label(doc, x, y, en, es, opts) {
    const o = Object.assign({ family: 'helvetica', size: 6.5, lead: null }, opts || {});
    const esSize = o.esSize || o.size;
    const lead = o.lead || o.size * PT * 1.15;
    doc.setTextColor(0);
    let tx = x;
    if (o.num) {
      font(doc, o.family, 'bold', o.size);
      text(doc, o.num, x, y);
      tx = x + doc.getTextWidth(o.num) + o.size * PT * 0.6;
    }
    font(doc, o.family, 'normal', o.size);
    if (en) text(doc, en, tx, y);
    font(doc, o.family, 'normal', esSize);
    if (es) text(doc, es, tx + (o.esIndent || 0), y + lead);
  }

  function labelCentered(doc, cx, y, en, es, size) {
    font(doc, 'helvetica', 'normal', size);
    doc.setTextColor(0);
    if (en) text(doc, en, cx, y, { align: 'center' });
    if (es) text(doc, es, cx, y + size * PT * 1.1, { align: 'center' });
  }

  function charBox(doc, x, y, n, cellW, h, value, opts) {
    const o = opts || {};
    box(doc, x, y, n * cellW, h);
    doc.setDrawColor(0);
    doc.setLineWidth(LINE_W);
    for (let i = 1; i < n; i++) {
      const bx = fx(x + i * cellW);
      if (o.full && o.full.indexOf(i) >= 0) doc.line(bx, y, bx, y + h);
      else if (!o.ticks || o.ticks.indexOf(i) >= 0) doc.line(bx, y + h, bx, y + h * (1 - TICK));
    }
    if (!value) return;
    setInk(doc, FILL_INK);
    font(doc, FILL_FONT, FILL_STYLE, Math.min(FILL_SIZE, (h / PT) * 0.95));
    const chars = String(value).split('').slice(0, n);
    const base = y + h * (1 - TICK) - 0.15;
    chars.forEach((c, i) => text(doc, c, x + (i + 0.5) * cellW, base, { align: 'center' }));
    setInk(doc, INK);
  }

  function fitSize(doc, str, w, max) {
    let size = max;
    doc.setFontSize(size);
    while (size > MIN_SIZE && doc.getTextWidth(str) > w) {
      size -= 0.5;
      doc.setFontSize(size);
    }
    return size;
  }

  function fillText(doc, x, y, w, h, value, maxSize) {
    if (!value) return;
    const str = String(value);
    setInk(doc, FILL_INK);
    font(doc, FILL_FONT, FILL_STYLE, maxSize || FREE_SIZE);
    const pad = 1;
    const size = fitSize(doc, str, w - 2 * pad, Math.min(maxSize || FREE_SIZE, (h / PT) * 0.9));
    let out = str;
    while (doc.getTextWidth(out) > w - 2 * pad && out.length > 1) out = out.slice(0, -1);
    text(doc, out, x + pad, y + h / 2 + size * PT * 0.3);
    setInk(doc, INK);
  }

  function textBox(doc, x, y, w, h, value, maxSize) {
    box(doc, x, y, w, h);
    fillText(doc, x, y, w, h, value, maxSize);
  }

  function strike(doc, x, y, w, h) {
    doc.setDrawColor(FILL_INK[0], FILL_INK[1], FILL_INK[2]);
    doc.setLineWidth(0.45);
    doc.line(fx(x) - 0.4, y - 0.4, fx(x + w) + 0.4, y + h + 0.4);
    doc.line(fx(x) - 0.4, y + h + 0.4, fx(x + w) + 0.4, y - 0.4);
    doc.setDrawColor(0);
    doc.setLineWidth(LINE_W);
  }

  const LETTER = { w: 5.2, h: 5.2, size: 14 };
  function letterBox(doc, x, y, letter, struck, w) {
    w = w || LETTER.w;
    box(doc, x, y, w, LETTER.h);
    font(doc, 'helvetica', 'bold', LETTER.size);
    doc.setTextColor(0);
    text(doc, letter, x + w / 2, y + LETTER.h - 0.75, { align: 'center' });
    if (struck) strike(doc, x, y, w, LETTER.h);
  }

  function bigLetter(doc, str, x, baseline) {
    font(doc, 'helvetica', 'bold', 13);
    doc.setTextColor(0);
    text(doc, str, x, baseline);
  }

  function wrap(doc, str, widths) {
    const words = String(str).split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    let li = 0;
    const width = () => widths[Math.min(li, widths.length - 1)];
    const push = () => { lines.push(cur); cur = ''; li++; };
    for (let word of words) {
      const cand = cur ? cur + ' ' + word : word;
      if (doc.getTextWidth(cand) <= width()) { cur = cand; continue; }
      if (cur) push();
      while (doc.getTextWidth(word) > width()) {
        let k = word.length - 1;
        while (k > 1 && doc.getTextWidth(word.slice(0, k)) > width()) k--;
        cur = word.slice(0, k);
        push();
        word = word.slice(k);
      }
      cur = word;
    }
    if (cur) lines.push(cur);
    return { lines, overflow: lines.length > widths.length };
  }

  function flowText(doc, slots, value) {
    if (!value) return;
    setInk(doc, FILL_INK);
    font(doc, FILL_FONT, FILL_STYLE, FREE_SIZE);
    const pad = 1;
    const widths = slots.map((s) => s.w - 2 * pad);
    const maxSize = Math.min(FREE_SIZE, ...slots.map((s) => (s.h / PT) * 0.9));
    let size = maxSize;
    let res;
    for (;;) {
      doc.setFontSize(size);
      res = wrap(doc, value, widths);
      if (!res.overflow || size <= MIN_SIZE) break;
      size -= 0.5;
    }
    res.lines.slice(0, slots.length).forEach((line, i) => {
      const s = slots[i];
      let out = line;
      if (i === slots.length - 1 && res.overflow) out = res.lines.slice(i).join(' ');
      while (doc.getTextWidth(out) > s.w - 2 * pad && out.length > 1) out = out.slice(0, -1);
      text(doc, out, s.x + pad, s.y + s.h / 2 + size * PT * 0.3);
    });
    setInk(doc, INK);
  }

  function drawHeader(doc, y) {
    band(doc, y, H.header, false);
    doc.setTextColor(0);
    font(doc, 'helvetica', 'normal', 9);
    text(doc, 'FLIGHT PLAN', FORM_W / 2, y + 3, { align: 'center' });
    font(doc, 'helvetica', 'bold', 9);
    text(doc, 'PLAN DE VUELO', FORM_W / 2, y + 6.3, { align: 'center' });
  }

  function drawCom(doc, y) {
    band(doc, y, H.com, true);
    label(doc, 2.2, y + 2.6, 'PRIORITY', 'Prioridad', { size: 5.8 });
    const end = eol(doc, 2.2, y + 11, '', 'FF');
    arrow(doc, end + 2.5, end + 9, y + 9.9);

    label(doc, 44.6, y + 2.2, 'ADRESSE(S)', 'Destinatarios', { size: 5.8, esIndent: 0.4 });
    box(doc, 44.3, y + 5.4, 137.1, 3.4);
    box(doc, 44.3, y + 8.8, 137.1, 3.4);
    box(doc, 44.3, y + 12.2, 91.3, 4.0);
    eol(doc, 143.4, y + 15.4);

    label(doc, 5.6, y + 18.6, 'FILING TIME', 'Hora de deposito', { size: 5.8, esIndent: 0.4 });
    charBox(doc, 5.6, y + 22.6, 6, 5.85, 4.5, '', { full: [2] });
    arrow(doc, 44.3, 51.3, y + 24.8);
    label(doc, 67.6, y + 18.6, 'ORIGINATOR', 'Remitente', { size: 5.8 });
    charBox(doc, 54.7, y + 22.6, 8, 4.84, 4.5, '');
    eol(doc, 96.5, y + 26.6);

    label(doc, 5.6, y + 31.3, 'SPECIFIC IDENTIFICATION OF ADDRESSEE(S) AND/OR ORIGINATOR',
      'Identificación exacta de los destinatarios o del remitente', { size: 5.8 });
  }

  function drawItems(doc, y, f) {
    band(doc, y, H.items, true);
    const L = { family: 'times', size: 8.5, esSize: 8, lead: 3.1 };

    let r = y + 5.6, b = y + 10.6;
    label(doc, 3.3, r, 'MESSAGE TYPE', 'Tipo de mensaje', Object.assign({ num: '3' }, L));
    eol(doc, 2.2, y + 14.2, '', ' (FPL');
    label(doc, 44.1, r, 'AIRCRAFT IDENTIFICATION', 'Identificación aeronave', Object.assign({ num: '7', esIndent: 1.2 }, L));
    charBox(doc, 44.1, b, 7, 5, 5, f.item7);
    label(doc, 96.5, r, 'FLIGHT RULES', 'Reglas de vuelo', Object.assign({ num: '8' }, L));
    dash(doc, 96.5, b + 3.2);
    charBox(doc, 104, b, 1, 7, 5, f.rules);
    label(doc, 145.6, r, 'TYPE OF FLIGHT', 'Tipo  de vuelo', Object.assign({ esIndent: 0.4 }, L));
    charBox(doc, 153, b, 1, 7, 5, f.flightType);
    eol(doc, 162.4, b + 4);

    r = y + 20.6; b = y + 27;
    label(doc, 6.7, r, 'NUMBER', 'Número', Object.assign({ num: '9', esIndent: 0.2 }, L));
    dash(doc, 5.6, b + 0.6);
    charBox(doc, 12.5, b, 2, 7, 5, f.number);
    label(doc, 36.8, r, 'TYPE OF AIRCRAFT', 'Tipo de aeronave', L);
    charBox(doc, 40.5, b, 4, 5.25, 5, f.acType);
    label(doc, 81.5, r, 'WAKE TURBULENCE CAT.', 'Cat. De estela turbulenta', L);
    doc.setDrawColor(0); doc.setLineWidth(0.35);
    doc.line(fx(93.2), b + 6.2, fx(96.2), b - 0.6);
    charBox(doc, 97, b + 0.8, 1, 7, 4.2, f.wake);
    label(doc, 152.1, r, 'EQUIPMENT', '', Object.assign({ num: '10' }, L));
    font(doc, 'times', 'normal', 8);
    text(doc, 'Equipo', 157.4, r + 3.1);
    dash(doc, 131.9, b + 0.6);
    textBox(doc, 138.7, b, 31.8, 5, joinEquip(f));
    eol(doc, 171.9, b + 4.2);

    r = y + 37.4; b = y + 42.4;
    label(doc, 40.2, r, 'DEPARTURE AERODROME', 'Aeródromo de salida', Object.assign({ num: '13' }, L));
    dash(doc, 44.3, b + 3.6);
    charBox(doc, 51, b, 4, 5.25, 5, f.dep);
    label(doc, 114, r, 'TIME', '', L);
    font(doc, 'times', 'normal', 8);
    text(doc, 'Hora', 114.6, r + 3.1);
    charBox(doc, 107.2, b, 4, 5.3, 5, f.eobt);

    r = y + 52.6; b = y + 57.4;
    label(doc, 3.3, r, 'CRUISING SPEED', 'Velocidad de crucero', Object.assign({ num: '15' }, L));
    dash(doc, 2, r + 3.8);
    charBox(doc, 8.9, b, 5, 4.96, 5, f.speed);
    label(doc, 55.6, r, 'LEVEL', 'Nivel', L);
    charBox(doc, 47.4, b, 5, 4.96, 5, f.level);
    label(doc, 92.6, r, 'ROUTE', 'Ruta', L);
    arrow(doc, 75.7, 86.2, b + 2.5);
    box(doc, 86.2, b, 94.8, 5);
  }

  function joinEquip(f) {
    if (!f.eq10a && !f.eq10b) return '';
    return (f.eq10a || '') + '/' + (f.eq10b || '');
  }

  function drawRouteLines(doc, y) {
    const slots = [];
    H.routeLines.forEach((h, i) => {
      band(doc, y, h, false);
      const last = i === H.routeLines.length - 1;
      if (last) {
        doc.setFillColor(GREY);
        doc.rect(fx(EOL_CELL_X), y, FORM_W - EOL_CELL_X, h, 'FD');
        eol(doc, EOL_CELL_X + 1.8, y + h / 2 + 1.4);
      }
      slots.push({ x: 0, y, w: last ? EOL_CELL_X : FORM_W, h });
      y += h;
    });
    return slots;
  }

  function drawItem16(doc, y, f) {
    band(doc, y, H.item16, true);
    const L = { family: 'times', size: 6.6, lead: 2.3 };
    const r = y + 3.6, b = y + 8;
    label(doc, 11.4, r, 'DESTINATION AERODROME', 'Aeródromo de destino', Object.assign({ num: '16', esIndent: 0.6 }, L));
    dash(doc, 12.4, b + 2.6);
    charBox(doc, 23.1, b, 4, 5.3, 5, f.dest);

    label(doc, 68.4, r, 'TOTAL EET', 'EET Total', L);
    font(doc, 'times', 'normal', 5.4);
    text(doc, 'HR   MIN', 68.4, r + 4.1);
    charBox(doc, 65.3, b + 1.0, 4, 4.2, 5, f.eet, { ticks: [2] });

    arrow(doc, 93.2, 103.8, b + 2.6);
    label(doc, 106.8, r, 'ALTN AERODROME', 'Aerodromo alt.', L);
    charBox(doc, 106, b, 4, 5.3, 5, f.altn1);

    arrow(doc, 132, 142.3, b + 2.6);
    label(doc, 144.7, r, '2ND ALTN AERODROME', '2º aerodromo alt.', Object.assign({ esIndent: 0.6 }, L));
    charBox(doc, 145.9, b, 4, 5.3, 5, f.altn2);
    eol(doc, 173, b + 4.2);
  }

  function drawItem18(doc, y) {
    const top = y;
    band(doc, y, H.item18Head, true);
    font(doc, 'helvetica', 'bold', 6.3);
    doc.setTextColor(0);
    text(doc, '18', 18.6, y + 2.6);
    label(doc, 25.3, y + 2.6, 'OTHER INFORMATION', 'Otros datos', { size: 6.3, esIndent: 0.3 });
    y += H.item18Head;

    const slots = [];
    H.item18Lines.forEach((h, i) => {
      band(doc, y, h, false);
      const first = i === 0;
      const last = i === H.item18Lines.length - 1;
      if (first) dash(doc, 2.5, y + h / 2, 3.5);
      if (last) {
        doc.setFillColor(GREY);
        doc.rect(fx(EOL_CELL_X), y, FORM_W - EOL_CELL_X, h, 'FD');
        eol(doc, EOL_CELL_X + 0.6, y + h / 2 + 1.4, ')');
      }
      const x = first ? ITEM18_LEFT_CELL : 0;
      slots.push({ x, y, w: (last ? EOL_CELL_X : FORM_W) - x, h });
      y += h;
    });
    doc.setDrawColor(0);
    doc.setLineWidth(LINE_W);
    doc.line(fx(ITEM18_LEFT_CELL), top, fx(ITEM18_LEFT_CELL), top + H.item18Head + H.item18Lines[0]);
    return slots;
  }

  function drawSupplementaryHeader(doc, y) {
    band(doc, y, H.gap, true);
    y += H.gap;
    band(doc, y, H.supp, true);
    doc.setTextColor(0);
    font(doc, 'helvetica', 'normal', 8.4);
    text(doc, 'SUPPLEMENTARY INFORMATION (NOT TO BE TRANSMITTED IN FPL MESSAGES)', FORM_W / 2, y + 3.1, { align: 'center' });
    font(doc, 'helvetica', 'normal', 7.8);
    text(doc, 'Información suplementaria (En los mensajes FPL no hay que transmitir estos datos)', FORM_W / 2, y + 6.1, { align: 'center' });
  }

  function drawItem19(doc, y, f) {
    band(doc, y, H.item19, true);
    const S = 6.3;

    font(doc, 'helvetica', 'bold', 7);
    doc.setTextColor(0);
    text(doc, '19', 9.2, y + 2.4);
    label(doc, 16.2, y + 2.4, 'ENDURANCE', '', { size: 7.4 });
    font(doc, 'helvetica', 'normal', 7.4);
    text(doc, 'Autonomia', 15.6, y + 5);
    font(doc, 'helvetica', 'normal', S);
    text(doc, 'HR/MIN', 30.1, y + 7.4, { align: 'center' });
    dash(doc, 4.6, y + 10.6, 1.8);
    bigLetter(doc, 'E/', 8.6, y + 12.4);
    charBox(doc, 16.2, y + 7.9, 4, 6.95, 3.8, f.endurance, { full: [2] });
    arrow(doc, 44.3, 54.1, y + 8.9);

    label(doc, 68.1, y + 4.8, 'PERSONS ON BOARD', 'Personas a bordo', { size: 7.4, lead: 2.5, esIndent: 0.4 });
    bigLetter(doc, 'P/', 59.2, y + 12.4);
    charBox(doc, 65.3, y + 7.9, 3, 7.07, 3.8, f.pob);

    arrow(doc, 111, 121.1, y + 9.9);
    label(doc, 145.1, y + 2.1, 'EMERGENCY RADIO', 'Equipo de emergencia', { size: 7.4, lead: 2.4 });
    bigLetter(doc, 'R/', 132.3, y + 12.6);
    const radio = f.radio || {};
    [['U', 'UHF', 142.5], ['V', 'VHF', 152.9], ['E', 'ELT', 166.8]].forEach(([k, lab, x]) => {
      labelCentered(doc, x + LETTER.w / 2, y + 7.0, lab, '', S + 0.2);
      letterBox(doc, x, y + 8.3, k, !radio[k]);
    });

    label(doc, 16.9, y + 15.4, 'SURVIVAL EQUIPMENT/Equipo de supervivencia', '', { size: 7.4 });
    label(doc, 102.9, y + 15.4, 'JACKETS/ Chalecos', '', { size: 7.4 });
    const ry = y + 21;
    arrow(doc, 9.2, 19.5, ry + 2.6);
    const sv = f.survival || {};
    letterBox(doc, 23.3, ry, 'S', !sv.any);
    bigLetter(doc, '/', 30.6, ry + 4.6);
    [['P', 'POLAR', 'Polar', 36], ['D', 'DESERT', 'Desértico', 51.4],
      ['M', 'MARITIME', 'Marítimo', 65.7], ['J', 'JUNGLE', 'Selva', 84.3]].forEach(([k, en, es, x]) => {
      labelCentered(doc, x + LETTER.w / 2, y + 17.7, en, es, S);
      letterBox(doc, x, ry, k, !sv.any || !sv[k]);
    });
    arrow(doc, 94.9, 102, ry + 2.6);
    const jk = f.jackets || {};
    letterBox(doc, 104.1, ry, 'J', !jk.any);
    [['L', 'LIGHT', 'Luz', 118], ['F', 'FLUORES', 'Fluor', 132.8],
      ['U', '', 'UHF', 147.9], ['V', '', 'VHF', 162.2]].forEach(([k, en, es, x]) => {
      labelCentered(doc, x + LETTER.w / 2, y + 17.7, en, es, S);
      letterBox(doc, x, ry, k, !jk.any || !jk[k]);
    });

    y += 2.4;
    label(doc, 24, y + 27.9, 'DINGHIES/Botes neumáticos', '', { size: 8 });
    const dg = f.dinghies || {};
    const dy = y + 33;
    labelCentered(doc, 31.9, y + 30.2, 'NUMBER', 'Numero', S);
    labelCentered(doc, 65.3, y + 30.2, 'CAPACITY', 'Capacidad', S);
    labelCentered(doc, 95.5, y + 29.3, 'COVER', 'Cubierta', S);
    labelCentered(doc, 128, y + 30.2, 'COLOUR', 'Color', S);
    arrow(doc, 2.2, 9.6, dy + 2.6);
    letterBox(doc, 10.6, dy, 'D', !dg.any);
    bigLetter(doc, '/', 17.4, dy + 4.6);
    charBox(doc, 23.1, dy + 0.6, 2, 8.8, 4, dg.any ? dg.number : '');
    arrow(doc, 44.3, 51.3, dy + 2.6);
    charBox(doc, 54.7, dy + 0.6, 3, 7.07, 4, dg.any ? dg.capacity : '');
    arrow(doc, 82.8, 90.6, dy + 2.6);
    letterBox(doc, 93.2, dy, 'C', !dg.any || !dg.cover, 4.6);
    arrow(doc, 99.6, 107.4, dy + 2.6);
    textBox(doc, 107.4, dy + 0.6, 45.7, 4, dg.any ? dg.colour : '');
    eol(doc, 155, dy + 4.2);

    label(doc, 24.8, y + 40.3, 'AIRCRAFT COLOUR AND MARKINGS', 'Color y marcas de la aeronave', { size: S });
    bigLetter(doc, 'A /', 9.6, y + 47.4);
    textBox(doc, 23.1, y + 43.1, 158.3, 4.2, f.colour);

    label(doc, 24.2, y + 49.4, 'REMARKS', 'Observaciones', { size: S });
    arrow(doc, 2.2, 9.6, y + 54.5);
    letterBox(doc, 10.6, y + 51.9, 'N', !f.remarks, 5.8);
    textBox(doc, 23.1, y + 52.4, 144.1, 4.2, f.remarks);
    eol(doc, 170.2, y + 56.1);

    label(doc, 24.2, y + 59.2, 'PILOT IN-COMMAND', 'Comandante de la aeronave', { size: S });
    bigLetter(doc, 'C', 10.4, y + 65.6);
    textBox(doc, 23.1, y + 61.9, 102.1, 4.2, f.pic);
    eol(doc, 127.8, y + 65.6, ') ');

    font(doc, 'helvetica', 'normal', 7.2);
    doc.setTextColor(0);
    text(doc, 'FILED BY/   Presentado por', 23.3, y + 68.7);
  }

  function drawFooter(doc, y, f) {
    const h = H.footer;
    const split = 65.3;
    band(doc, y, h, false);
    doc.setDrawColor(0);
    doc.line(fx(split), y, fx(split), y + h);

    fillText(doc, 2, y + (h - 6) / 2, split - 4, 6, f.filedBy);

    label(doc, 74.2, y + 2.5, 'SPACE RESERVED FOR ADDOTIONAL REQUIREMENTS',
      'Espacio reservado para requisitos adicionales', { size: 5.8 });
    font(doc, 'helvetica', 'normal', 5.8);
    text(doc, 'PILOT IN COMMAND SIGNATURE/ Firma del Comandante de la aeronave', FORM_W - 1.5, y + h - 1.2, { align: 'right' });

    if (f.signature) drawSignature(doc, f.signature, split + 3, y + 5.4, FORM_W - split - 6, h - 9.6);
  }

  function drawSignature(doc, dataUrl, x, y, w, h) {
    try {
      const p = doc.getImageProperties(dataUrl);
      const s = Math.min(w / p.width, h / p.height);
      const iw = p.width * s, ih = p.height * s;
      doc.addImage(dataUrl, p.fileType || 'PNG', fx(x + (w - iw) / 2), y + (h - ih) / 2, iw, ih);
    } catch (e) {
      console.warn('PDV_PDF: signature image skipped', e);
    }
  }

  function render(fpl) {
    const f = Object.assign({}, fpl || {});
    const JsPDF = window.jspdf.jsPDF;
    const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    doc.setProperties({ title: 'Plan de vuelo' + (f.item7 ? ' ' + f.item7 : ''), creator: 'PDV-Gen' });
    doc.setLineWidth(LINE_W);

    let y = FORM_Y;
    drawHeader(doc, y); y += H.header;
    drawCom(doc, y); y += H.com;
    const itemsTop = y;
    drawItems(doc, y, f); y += H.items;
    const routeSlots = drawRouteLines(doc, y);
    y += H.routeLines.reduce((a, b) => a + b, 0);
    drawItem16(doc, y, f); y += H.item16;
    const otherSlots = drawItem18(doc, y);
    y += H.item18Head + H.item18Lines.reduce((a, b) => a + b, 0);
    drawSupplementaryHeader(doc, y); y += H.gap + H.supp;
    drawItem19(doc, y, f); y += H.item19;
    drawFooter(doc, y, f); y += H.footer;

    flowText(doc, [{ x: 86.2, y: itemsTop + 57.4, w: 94.8, h: 5 }].concat(routeSlots), f.route);
    flowText(doc, otherSlots, f.item18);

    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.rect(fx(0), FORM_Y, FORM_W, y - FORM_Y);
    return doc;
  }

  window.PDV_PDF = { render };
})();

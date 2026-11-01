(function () {
  'use strict';

  // Values are drawn over the EANA form image (data/form.js). Box positions are in mm,
  // measured from the 150 dpi template: interior of each white box (x, y, w, h).
  const PAGE_W = 210;
  const PAGE_H = 297;

  const B = {
    item7: [63.2, 69.3, 44.7, 4.6],
    rules: [139.7, 69.3, 5.8, 4.6],
    flightType: [177.5, 69.3, 5.8, 4.6],
    number: [19.3, 84.0, 12.0, 4.7],
    acType: [50.6, 84.0, 25.2, 4.7],
    wake: [104.8, 84.0, 5.8, 4.7],
    eq10a: [119.2, 84.0, 53.4, 4.7],
    eq10b: [174.4, 84.0, 18.8, 4.7],
    dep: [56.9, 96.9, 25.2, 4.6],
    eobt: [127.2, 96.9, 24.6, 4.6],
    speed: [13.2, 111.8, 30.7, 4.4],
    level: [56.9, 111.8, 32.0, 4.4],
    dest: [31.8, 147.3, 24.6, 4.6],
    eet: [76.4, 147.3, 25.1, 4.6],
    altn1: [120.9, 147.3, 24.6, 4.6],
    altn2: [165.0, 147.3, 24.6, 4.6],
    endurance: [19.3, 198.3, 24.6, 4.6],
    pob: [69.6, 198.3, 19.3, 4.6],
    dinghyNumber: [25.6, 233.9, 12.0, 4.6],
    dinghyCapacity: [50.6, 233.9, 25.2, 4.6],
    dinghyColour: [114.7, 233.9, 56.1, 4.6],
    colour: [25.6, 246.6, 170.2, 4.7],
    remarks: [25.6, 257.4, 151.4, 4.6],
    pic: [25.6, 268.3, 113.6, 4.6],
    filedBy: [6.4, 276.2, 69.4, 12.9],
    signature: [112, 278.2, 80, 8.2],
  };

  const ROUTE = [
    [102.1, 111.8, 99.9, 4.4],
    [6.4, 116.7, 195.6, 4.4],
    [6.4, 121.8, 195.6, 4.4],
    [6.4, 126.7, 195.6, 4.4],
    [6.4, 131.6, 183.1, 4.6],
  ];
  const ITEM18 = [
    [19.3, 160.0, 182.7, 4.4],
    [6.4, 165.1, 195.6, 4.2],
    [6.4, 170.0, 195.6, 4.4],
    [6.4, 174.9, 183.1, 4.6],
  ];

  // Item 19 letter boxes: [x, y]; all are 5.8 x 4.6.
  const LETTER = { w: 5.8, h: 4.6 };
  const RADIO = { U: [152.1, 198.3], V: [164.6, 198.3], E: [176.8, 198.3] };
  const SURVIVAL = { any: [25.6, 216.1], P: [38.1, 216.1], D: [50.8, 216.1], M: [63.2, 216.1], J: [75.0, 216.1] };
  const JACKETS = { any: [102.1, 216.3], L: [120.9, 216.3], F: [139.7, 216.3], U: [158.7, 216.3], V: [177.5, 216.3] };
  const DINGHY = [13.4, 233.9];
  const COVER = [89.4, 233.9];
  const REMARKS_N = [13.4, 257.4];

  const FILL_INK = [10, 30, 110];
  const FILL_FONT = 'courier';
  const FILL_STYLE = 'bold';
  const FILL_SIZE = 11;
  const FREE_SIZE = 10;
  const MIN_SIZE = 5.5;
  const PAD = 1;
  const PT = 25.4 / 72;

  function ink(doc) {
    doc.setDrawColor(FILL_INK[0], FILL_INK[1], FILL_INK[2]);
    doc.setTextColor(FILL_INK[0], FILL_INK[1], FILL_INK[2]);
  }

  function font(doc, size) {
    doc.setFont(FILL_FONT, FILL_STYLE);
    doc.setFontSize(size);
  }

  const baseline = (y, h, size) => y + h / 2 + size * PT * 0.33;

  // Fixed-length codes: one character per equal cell, so short values line up like the paper form.
  function spaced(doc, b, value, cells) {
    if (!value) return;
    const [x, y, w, h] = b;
    const chars = String(value).split('');
    const n = Math.max(cells || 1, chars.length);
    const cw = w / n;
    font(doc, Math.min(FILL_SIZE, (cw / PT) * 1.6));
    const size = doc.getFontSize();
    chars.forEach((c, i) => doc.text(c, x + (i + 0.5) * cw, baseline(y, h, size), { align: 'center' }));
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

  function fillText(doc, b, value, opts) {
    if (!value) return;
    const [x, y, w, h] = b;
    const o = opts || {};
    const str = String(value);
    font(doc, FREE_SIZE);
    const size = fitSize(doc, str, w - 2 * PAD, Math.min(FREE_SIZE, (h / PT) * 0.9));
    let out = str;
    while (doc.getTextWidth(out) > w - 2 * PAD && out.length > 1) out = out.slice(0, -1);
    if (o.center) doc.text(out, x + w / 2, baseline(y, h, size), { align: 'center' });
    else doc.text(out, x + PAD, baseline(y, h, size));
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
    font(doc, FREE_SIZE);
    const widths = slots.map((s) => s[2] - 2 * PAD);
    let size = Math.min(FREE_SIZE, ...slots.map((s) => (s[3] / PT) * 0.9));
    let res;
    for (;;) {
      doc.setFontSize(size);
      res = wrap(doc, value, widths);
      if (!res.overflow || size <= MIN_SIZE) break;
      size -= 0.5;
    }
    res.lines.slice(0, slots.length).forEach((line, i) => {
      const [x, y, w, h] = slots[i];
      let out = line;
      if (i === slots.length - 1 && res.overflow) out = res.lines.slice(i).join(' ');
      while (doc.getTextWidth(out) > w - 2 * PAD && out.length > 1) out = out.slice(0, -1);
      doc.text(out, x + PAD, baseline(y, h, size));
    });
  }

  // Crosses out a printed letter box (item not carried), covering its border.
  function strike(doc, pos, struck) {
    if (!struck) return;
    const x = pos[0] - 0.6, y = pos[1] - 0.6, w = LETTER.w + 1.2, h = LETTER.h + 1.2;
    doc.setLineWidth(0.45);
    doc.line(x, y, x + w, y + h);
    doc.line(x, y + h, x + w, y);
  }

  function drawSignature(doc, dataUrl, b) {
    const [x, y, w, h] = b;
    try {
      const p = doc.getImageProperties(dataUrl);
      const s = Math.min(w / p.width, h / p.height);
      const iw = p.width * s, ih = p.height * s;
      doc.addImage(dataUrl, p.fileType || 'PNG', x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
    } catch (e) {
      console.warn('PDV_PDF: signature image skipped', e);
    }
  }

  function render(fpl) {
    const f = Object.assign({}, fpl || {});
    if (!window.PDV_FORM) throw new Error('PDV_PDF: form template (data/form.js) not loaded');
    const JsPDF = window.jspdf.jsPDF;
    const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    doc.setProperties({ title: 'Plan de vuelo' + (f.item7 ? ' ' + f.item7 : ''), creator: 'PDV-Gen' });
    doc.addImage(window.PDV_FORM, 'JPEG', 0, 0, PAGE_W, PAGE_H, 'form');
    ink(doc);

    spaced(doc, B.item7, f.item7, 7);
    spaced(doc, B.rules, f.rules);
    spaced(doc, B.flightType, f.flightType);
    spaced(doc, B.number, f.number, 2);
    spaced(doc, B.acType, f.acType, 4);
    spaced(doc, B.wake, f.wake);
    fillText(doc, B.eq10a, f.eq10a, { center: true });
    fillText(doc, B.eq10b, f.eq10b, { center: true });
    spaced(doc, B.dep, f.dep, 4);
    spaced(doc, B.eobt, f.eobt, 4);
    spaced(doc, B.speed, f.speed, 5);
    spaced(doc, B.level, f.level, 5);
    flowText(doc, ROUTE, f.route);

    spaced(doc, B.dest, f.dest, 4);
    spaced(doc, B.eet, f.eet, 4);
    spaced(doc, B.altn1, f.altn1, 4);
    spaced(doc, B.altn2, f.altn2, 4);
    flowText(doc, ITEM18, f.item18);

    spaced(doc, B.endurance, f.endurance, 4);
    spaced(doc, B.pob, f.pob, 3);
    const radio = f.radio || {};
    Object.keys(RADIO).forEach((k) => strike(doc, RADIO[k], !radio[k]));
    const sv = f.survival || {};
    Object.keys(SURVIVAL).forEach((k) => strike(doc, SURVIVAL[k], !sv.any || (k !== 'any' && !sv[k])));
    const jk = f.jackets || {};
    Object.keys(JACKETS).forEach((k) => strike(doc, JACKETS[k], !jk.any || (k !== 'any' && !jk[k])));

    const dg = f.dinghies || {};
    strike(doc, DINGHY, !dg.any);
    strike(doc, COVER, !dg.any || !dg.cover);
    if (dg.any) {
      spaced(doc, B.dinghyNumber, dg.number, 2);
      spaced(doc, B.dinghyCapacity, dg.capacity, 3);
      fillText(doc, B.dinghyColour, dg.colour);
    }

    fillText(doc, B.colour, f.colour);
    strike(doc, REMARKS_N, !f.remarks);
    fillText(doc, B.remarks, f.remarks);
    fillText(doc, B.pic, f.pic);
    fillText(doc, [B.filedBy[0], B.filedBy[1] + 3.5, B.filedBy[2], 6], f.filedBy, { center: true });
    if (f.signature) drawSignature(doc, f.signature, B.signature);
    return doc;
  }

  window.PDV_PDF = { render };
})();

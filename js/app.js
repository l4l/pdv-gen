(function () {
  'use strict';
  const F = window.PDV_FPL, S = window.PDV_STORE, I18N = window.PDV_I18N;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k);
    return el;
  };

  const db = S.load();
  let lang = db.lang === 'en' ? 'en' : 'es';
  const t = (k) => I18N[lang][k] || I18N.es[k] || k;
  const persist = () => { S.save(db); $('#storage-warn').hidden = S.ok; };

  const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, p, v) => {
    const ks = p.split('.');
    const last = ks.pop();
    ks.reduce((a, k) => (a[k] = a[k] || {}), o)[last] = v;
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const todayUTC = () => new Date().toISOString().slice(0, 10);

  const AD = window.PDV_AERODROMES || [];
  const AC = window.PDV_AIRCRAFT || [];
  const ARO = window.PDV_ARO || [];
  const adByCode = new Map();
  for (const a of AD) { if (a.i) adByCode.set(a.i, a); if (a.l && !adByCode.has(a.l)) adByCode.set(a.l, a); }
  const acByType = new Map(AC.map((a) => [a.t, a]));

  function fillDatalists() {
    const ad = $('#dl-ad');
    ad.replaceChildren(...AD.flatMap((a) => {
      const label = a.n + (a.p ? ', ' + a.p : '') + (a.x ? ' (' + t('ad.closed') + ')' : '');
      const out = [];
      if (a.i) out.push(h('option', { value: a.i }, (a.l ? a.l + ' · ' : '') + label));
      if (a.l) out.push(h('option', { value: a.l }, (a.i ? a.i + ' · ' : '') + label));
      return out;
    }));
    $('#dl-ac').replaceChildren(...AC.map((a) => h('option', { value: a.t }, a.n + ' · ' + a.w)));
  }

  const EQUIP = () => ({
    radio: { U: false, V: true, E: true },
    survival: { any: false, P: false, D: false, M: false, J: false },
    jackets: { any: false, L: false, F: false, U: false, V: false },
    dinghies: { any: false, number: '', capacity: '', cover: false, colour: '' },
  });
  const newPlane = () => ({
    id: S.uid(), reg: '', acType: '', wake: 'L', eq10a: 'SDFGY', eq10b: 'C', speed: '', endurance: '',
    opr: '', pbn: '', nav: '', com: '', dat: '', sur: '', sel: '', code: '', typ: '', per: '', colour: '', notes: '', ...EQUIP(),
  });
  const PLANE_KEYS = ['acType', 'wake', 'eq10a', 'eq10b', 'speed', 'endurance', 'opr', 'pbn', 'nav', 'com', 'dat', 'sur',
    'sel', 'code', 'typ', 'per', 'colour', 'radio', 'survival', 'jackets', 'dinghies'];
  const planeToFlight = (p) => {
    const o = { item7: F.normId(p.reg) };
    for (const k of PLANE_KEYS) o[k] = clone(p[k] ?? '');
    return o;
  };
  const newFlight = (plane, pilot) => ({
    planeId: plane ? plane.id : '', pilotId: pilot ? pilot.id : '',
    rules: 'V', flightType: 'G', number: '', item7: '', acType: '', wake: '', eq10a: '', eq10b: '',
    dep: '', depName: '', date: todayUTC(), eobt: '', speed: '', level: '', route: 'DCT',
    dest: '', destName: '', eet: '', altn1: '', altn2: '', altnName: '',
    sts: '', pbn: '', nav: '', com: '', dat: '', sur: '', reg: '', eet18: '', sel: '', typ: '', code: '', dle: '',
    opr: '', orgn: '', per: '', ralt: '', talt: '', rif: '', rmk: '',
    endurance: '', pob: '', colour: '', remarks: '', pic: pilot ? pilot.name : '', filedBy: pilot ? pilot.name : '',
    ...EQUIP(), ...(plane ? planeToFlight(plane) : {}),
  });

  const PLANE_ERR_KEYS = new Set([...PLANE_KEYS, 'item7', 'dNumber', 'dCapacity', 'dColour']);
  function validatePlane(p) {
    const fake = { ...newFlight(null, null), ...planeToFlight(p), dep: 'SADF', eobt: '1200', dest: 'SADF', eet: '0001', level: 'VFR', pob: '1', pic: 'X' };
    if (!p.endurance) fake.endurance = '0100';
    if (!p.speed) fake.speed = 'N0100';
    const e = F.validate(fake);
    const out = {};
    for (const [k, v] of Object.entries(e)) if (PLANE_ERR_KEYS.has(k)) out[k === 'item7' ? 'reg' : k] = v;
    if (!p.opr) delete out.opr;
    return out;
  }

  const fld = (k, o = {}) => ({ k, type: 'text', w: 8, up: true, ...o });
  const isZ = (v) => F.norm(v) === 'ZZZZ';
  const AIRCRAFT_FIELDS = [
    fld('item7', { w: 9, hint: 'h.item7' }),
    fld('rules', { type: 'seg', opts: ['V', 'I', 'Y', 'Z'] }),
    fld('flightType', { type: 'seg', opts: ['G', 'N', 'M', 'X', 'S'] }),
    fld('number', { w: 3 }),
    fld('acType', { w: 6, list: 'dl-ac' }),
    fld('wake', { type: 'seg', opts: ['L', 'M', 'H', 'J'] }),
    fld('eq10a', { w: 14, hint: 'h.eq10a', pick: 'a' }),
    fld('eq10b', { w: 10, hint: 'h.eq10b', pick: 'b' }),
  ];
  const ind18 = (k) => fld(k, { w: k === 'sel' || k === 'per' ? 6 : 18, label: (k === 'eet18' ? 'EET' : k.toUpperCase()) + '/', hint: k === 'typ' ? 'h.typ' : null });
  const MORE18 = ['sts', 'pbn', 'nav', 'com', 'dat', 'sur', 'reg', 'eet18', 'sel', 'typ', 'code', 'dle', 'orgn', 'per', 'ralt', 'talt', 'rif'].map(ind18);
  const dinghyOn = (s) => s.dinghies && s.dinghies.any;
  const EQUIP_FIELDS = [
    fld('radio', { type: 'equip', letters: ['U', 'V', 'E'] }),
    fld('survival', { type: 'equip', letters: ['P', 'D', 'M', 'J'], any: true }),
    fld('jackets', { type: 'equip', letters: ['L', 'F', 'U', 'V'], any: true }),
    fld('dinghies', { type: 'equip', letters: [], any: true }),
    fld('dinghies.number', { w: 3, lk: 'f.dNumber', err: 'dNumber', show: dinghyOn }),
    fld('dinghies.capacity', { w: 4, lk: 'f.dCapacity', err: 'dCapacity', show: dinghyOn }),
    fld('dinghies.cover', { type: 'check', lk: 'f.dCover', show: dinghyOn }),
    fld('dinghies.colour', { w: 14, lk: 'f.dColour', err: 'dColour', show: dinghyOn }),
  ];

  const FLIGHT_SECTIONS = [
    { id: 'aircraft', title: 's.aircraft', items: '7–10', fold: true, summary: (s) => {
      const n = F.normalize(s);
      if (!n.item7) return '';
      return [n.item7, n.rules + n.flightType, (n.number || '') + n.acType + '/' + n.wake, n.eq10a + '/' + n.eq10b].join(' · ');
    }, fields: AIRCRAFT_FIELDS },
    { id: 'dep', title: 's.dep', items: '13', fields: [
      fld('dep', { w: 6, list: 'dl-ad', ad: true }),
      fld('date', { type: 'date', up: false }),
      fld('eobt', { w: 5, localTime: true }),
      fld('depName', { w: 30, show: (s) => ['ZZZZ', 'AFIL'].includes(F.norm(s.dep)) }),
    ] },
    { id: 'route', title: 's.route', items: '15', fields: [
      fld('speed', { w: 6, hint: 'h.speed' }),
      fld('level', { w: 6, hint: 'h.level' }),
      fld('route', { type: 'textarea', hint: 'h.route' }),
    ] },
    { id: 'dest', title: 's.dest', items: '16', fields: [
      fld('dest', { w: 6, list: 'dl-ad', ad: true }),
      fld('eet', { w: 5, ph: 'HHMM' }),
      fld('altn1', { w: 6, list: 'dl-ad', ad: true }),
      fld('altn2', { w: 6, list: 'dl-ad', ad: true }),
      fld('destName', { w: 30, show: (s) => isZ(s.dest) }),
      fld('altnName', { w: 30, show: (s) => isZ(s.altn1) || isZ(s.altn2) }),
    ] },
    { id: 'other', title: 's.other', items: '18', fields: [
      fld('opr', { w: 24 }),
      fld('rmk', { w: 40 }),
      { sub: { id: 'more18', title: 's.more18', fields: MORE18 } },
    ] },
    { id: 'supp', title: 's.supp', items: '19', fields: [
      fld('endurance', { w: 5, ph: 'HHMM' }),
      fld('pob', { w: 4, hint: 'h.pob' }),
      fld('colour', { w: 28 }),
      fld('pic', { w: 24 }),
      fld('filedBy', { w: 24 }),
      { sub: { id: 'equip', title: 's.equip', fields: [...EQUIP_FIELDS, fld('remarks', { w: 30 })], summary: equipSummary } },
    ] },
  ];

  const PLANE_SECTIONS = [
    { id: 'p-main', title: 's.aircraft', fields: [
      fld('reg', { w: 9, lk: 'f.item7', hint: 'h.item7' }),
      fld('acType', { w: 6, list: 'dl-ac' }),
      fld('wake', { type: 'seg', opts: ['L', 'M', 'H', 'J'] }),
      fld('eq10a', { w: 14, hint: 'h.eq10a', pick: 'a' }),
      fld('eq10b', { w: 10, hint: 'h.eq10b', pick: 'b' }),
      fld('speed', { w: 6, hint: 'h.speed' }),
      fld('endurance', { w: 5, ph: 'HHMM' }),
      fld('colour', { w: 28 }),
      fld('opr', { w: 24 }),
    ] },
    { id: 'p-18', title: 's.plane18', fold: true, fields: ['pbn', 'nav', 'com', 'dat', 'sur', 'sel', 'code', 'typ', 'per'].map(ind18) },
    { id: 'p-19', title: 's.plane19', fold: true, summary: equipSummary, fields: EQUIP_FIELDS },
    { id: 'p-notes', title: 'f.notes', fold: true, fields: [fld('notes', { type: 'textarea', up: false, lk: 'f.notes' })] },
  ];

  function equipSummary(s) {
    const n = F.normalize(s);
    const r = ['U', 'V', 'E'].filter((c) => n.radio && n.radio[c]).join('') || '—';
    const g = (o, ls) => (o && o.any ? ls.filter((c) => o[c]).join('') || '✓' : '—');
    return 'R/' + r + ' · S/' + g(n.survival, ['P', 'D', 'M', 'J']) + ' · J/' + g(n.jackets, ['L', 'F', 'U', 'V']) + ' · D/' + (n.dinghies && n.dinghies.any ? n.dinghies.number || '?' : '—');
  }

  function buildForm(form, sections, state, onChange) {
    const touched = new Set();
    const rows = [];

    const fieldEl = (sp) => {
      const id = 'f-' + form.id + '-' + sp.k.replace('.', '-');
      const label = sp.label || t(sp.lk || 'f.' + sp.k);
      const errEl = h('small', { class: 'err' });
      const hintEl = h('small', { class: 'hint' }, sp.hint ? t(sp.hint) : '');
      let input, wrap;
      const val = get(state, sp.k);
      const change = (v) => { set(state, sp.k, v); touched.add(sp.err || sp.k); onChange(sp.k); };

      if (sp.type === 'seg') {
        input = h('div', { class: 'seg', role: 'radiogroup', id },
          sp.opts.map((o) => h('button', { type: 'button', role: 'radio', 'aria-checked': String(val === o), onclick: (ev) => {
            $$('button', input).forEach((b) => b.setAttribute('aria-checked', String(b === ev.currentTarget)));
            change(o);
          } }, o)));
        wrap = h('div', { class: 'field' }, h('span', { class: 'lbl' }, label), input, errEl);
      } else if (sp.type === 'equip') {
        const o = val || {};
        const box = (letter, isAny) => {
          const cb = h('input', { type: 'checkbox', checked: isAny ? o.any : o[letter] });
          cb.addEventListener('change', () => {
            set(state, sp.k + '.' + (isAny ? 'any' : letter), cb.checked);
            if (isAny) $$('.eq-letters input', wrap).forEach((x) => (x.disabled = !cb.checked));
            onChange(sp.k);
          });
          if (!isAny && sp.any && !o.any) cb.disabled = true;
          return h('label', { class: 'chk' }, cb, isAny ? t('f.carried') : h('span', {}, h('b', {}, letter), ' ' + t('eq.' + letter)));
        };
        wrap = h('div', { class: 'field equip' },
          h('span', { class: 'lbl' }, t('f.' + sp.k)),
          h('div', { class: 'eq-row' }, sp.any ? box(null, true) : null, h('span', { class: 'eq-letters' }, sp.letters.map((l) => box(l, false)))));
      } else if (sp.type === 'check') {
        input = h('input', { type: 'checkbox', id, checked: !!val });
        input.addEventListener('change', () => change(input.checked));
        wrap = h('label', { class: 'field chk' }, input, label);
      } else {
        const attrs = { id, name: sp.k, spellcheck: 'false', placeholder: sp.ph || '', list: sp.list };
        if (sp.type === 'textarea') input = h('textarea', { ...attrs, rows: 2 });
        else input = h('input', { ...attrs, type: sp.type === 'date' ? 'date' : 'text', size: sp.w, style: `--w:${sp.w}ch` });
        if (sp.up) input.classList.add('up');
        input.value = val ?? '';
        input.addEventListener('input', () => {
          if (sp.up && input.value !== input.value.toUpperCase()) {
            const p = input.selectionStart;
            input.value = input.value.toUpperCase();
            try { input.setSelectionRange(p, p); } catch (e) {}
          }
          change(input.value);
        });
        input.addEventListener('blur', () => { touched.add(sp.err || sp.k); onChange(null); });
        wrap = h('div', { class: 'field' + (sp.type === 'textarea' ? ' wide' : ''), style: `--w:${sp.w}ch` },
          h('label', { for: id, class: 'lbl' }, label), sp.pick ? equipPicker(sp, input, change) : input, hintEl, errEl);
      }
      rows.push({ sp, wrap, input, errEl, hintEl });
      return wrap;
    };

    const sectionEl = (sec, nested) => {
      const body = h('div', { class: 'grid' }, sec.fields.map((f) => (f.sub ? sectionEl(f.sub, true) : fieldEl(f))));
      const head = [h('span', { class: 'sec-title' }, sec.items ? h('span', { class: 'item' }, sec.items) : null, t(sec.title)),
        h('span', { class: 'sec-sum', 'data-sum': sec.id })];
      const el = sec.fold || nested
        ? h('details', { class: 'sec' + (nested ? ' nested' : ''), 'data-sec': sec.id }, h('summary', {}, ...head), body)
        : h('fieldset', { class: 'sec', 'data-sec': sec.id }, h('legend', {}, ...head), body);
      el._sec = sec;
      return el;
    };

    form.replaceChildren(...sections.map((s) => sectionEl(s, false)));

    return {
      update(errors, showAll) {
        for (const r of rows) {
          const key = r.sp.err || r.sp.k;
          const e = errors[key];
          const v = get(state, r.sp.k);
          const shown = e && (showAll || touched.has(key) || (v !== '' && v != null));
          r.errEl.textContent = shown ? e[lang] : '';
          r.wrap.classList.toggle('bad', !!shown);
          r.wrap.hidden = r.sp.show ? !r.sp.show(state) : false;
          if (r.sp.ad) r.hintEl.replaceChildren(...adHint(v));
          if (r.sp.localTime) r.hintEl.textContent = localHint(v);
        }
        for (const d of $$('details', form)) {
          const inner = $$('.field', d).map((w) => rows.find((r) => r.wrap === w)).filter(Boolean);
          if (inner.some((r) => r.wrap.classList.contains('bad'))) d.open = true;
          else if (d.dataset.sec === 'more18' && inner.some((r) => r.sp.type === 'text' && get(state, r.sp.k))) d.open = true;
        }
        for (const el of $$('[data-sum]', form)) {
          const sec = el.closest('[data-sec]')._sec;
          el.textContent = sec.summary ? sec.summary(state) : '';
        }
      },
      firstError() { return rows.find((r) => r.wrap.classList.contains('bad')); },
      sync(path) {
        const r = rows.find((x) => x.sp.k === path);
        if (!r) return;
        const v = get(state, path);
        if (r.sp.type === 'seg') $$('button', r.input).forEach((b) => b.setAttribute('aria-checked', String(b.textContent === v)));
        else if (r.input) r.input.value = v ?? '';
      },
    };
  }

  function adHint(code) {
    const c = F.norm(code);
    const a = adByCode.get(c);
    if (!a) return [];
    const out = [a.n + (a.p ? ', ' + a.p : '') + (a.x ? ' — ' + t('ad.closed') : '')];
    const other = c === a.i ? a.l : a.i;
    if (other) out.push(' · ', h('b', {}, other));
    return out;
  }
  function equipPicker(sp, input, change) {
    const codes = sp.pick === 'a' ? F.EQ10A : F.EQ10B;
    const MODES = ['A', 'C', 'E', 'H', 'I', 'L', 'P', 'S', 'X'];
    const desc = window.PDV_EQ[sp.pick];
    const current = () => new Set(F.tokens(F.norm(input.value).replace(/ /g, ''), codes));
    const boxes = codes.map((c) => {
      const cb = h('input', { type: 'checkbox', value: c });
      cb.addEventListener('change', () => toggle(c, cb.checked));
      return { c, cb, el: h('label', { class: 'pick-item' }, cb, h('b', {}, c), h('span', {}, desc[c][lang === 'es' ? 0 : 1])) };
    });
    const panel = h('div', { class: 'picker', hidden: true }, boxes.map((b) => b.el));
    const btn = h('button', { type: 'button', class: 'ghost pick-btn', 'aria-expanded': 'false', title: t('f.' + sp.k) }, '▾');
    const wrap = h('span', { class: 'pick-wrap' }, input, btn);
    const sync = () => { const s = current(); boxes.forEach((b) => (b.cb.checked = s.has(b.c))); };
    function toggle(c, on) {
      const s = current();
      if (on) {
        if (c === 'N') s.clear(); else s.delete('N');
        if (sp.pick === 'b' && MODES.includes(c)) MODES.forEach((m) => s.delete(m));
        s.add(c);
      } else s.delete(c);
      input.value = codes.filter((x) => s.has(x)).join('');
      change(input.value);
      sync();
    }
    btn.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', String(!panel.hidden));
      wrap.closest('.field').classList.toggle('picking', !panel.hidden);
      sync();
    });
    input.addEventListener('input', sync);
    return h('span', { class: 'pick-box' }, wrap, panel);
  }

  function localHint(v) {
    const c = F.norm(v);
    if (!/^([01]\d|2[0-3])[0-5]\d$/.test(c)) return 'HHMM';
    const m = (+c.slice(0, 2) * 60 + +c.slice(2) - 180 + 1440) % 1440;
    return '= ' + String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') + ' ' + t('h.local');
  }

  let cur = db.current || newFlight(db.planes[0], db.pilots[0]);
  let flightForm, showAll = false;

  const pilotOf = () => db.pilots.find((p) => p.id === cur.pilotId);
  const planeOf = () => db.planes.find((p) => p.id === cur.planeId);

  function renderSelects() {
    const opt = (v, label, sel) => h('option', { value: v, selected: sel }, label);
    $('#sel-plane').replaceChildren(opt('', t('sel.none')), ...db.planes.map((p) =>
      opt(p.id, p.reg + ' · ' + p.acType, p.id === cur.planeId)));
    $('#sel-pilot').replaceChildren(opt('', t('sel.none')), ...db.pilots.map((p) =>
      opt(p.id, p.name, p.id === cur.pilotId)));
    $('#no-plane').hidden = db.planes.length > 0;
  }

  function renderFlight() {
    if (!cur.pilotId && db.pilots.length === 1) cur.pilotId = db.pilots[0].id;
    const pilot = pilotOf();
    if (pilot && !F.norm(cur.pic)) { cur.pic = pilot.name; cur._lastPic = pilot.name; if (!F.norm(cur.filedBy)) cur.filedBy = pilot.name; }
    renderSelects();
    flightForm = buildForm($('#flight-form'), FLIGHT_SECTIONS, cur, onFlightChange);
    refreshFlight();
  }

  function suggestWake(o, ui) {
    const a = acByType.get(F.norm(o.acType));
    if (a && o.wake !== a.w) { o.wake = a.w; ui.sync('wake'); }
  }

  function onFlightChange(path) {
    if (path === 'acType') suggestWake(cur, flightForm);
    if (path === 'pic' && (!cur.filedBy || cur.filedBy === cur._lastPic)) {
      cur.filedBy = cur.pic;
      const fb = $('#flight-form [name="filedBy"]');
      if (fb) fb.value = cur.pic;
    }
    cur._lastPic = cur.pic;
    refreshFlight();
  }

  let saveTimer;
  function refreshFlight() {
    const errors = F.validate(cur);
    flightForm.update(errors, showAll);
    const blank = !cur.item7 && !cur.planeId;
    $('#fpl-msg').textContent = blank ? '—' : F.message(cur);
    $('#fpl-19').textContent = (!blank && F.item19(F.normalize(cur))) || '—';
    const n = Object.keys(errors).length;
    const text = blank ? t('p.start') : n ? n + ' ' + t(n === 1 ? 'p.error1' : 'p.errors') : '✓ ' + t('p.ok');
    for (const st of $$('.status')) {
      st.className = 'status ' + (blank ? '' : n ? 'bad' : 'ok');
      st.textContent = text;
    }
    for (const b of $$('.btn-pdf, #btn-view')) b.disabled = n > 0;
    if (blank) $('#flight-form [data-sec="aircraft"]').open = true;
    renderAro();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { db.current = cur; persist(); }, 300);
  }

  function renderAro() {
    const dep = F.norm(cur.dep);
    const box = $('#aro');
    if (!dep) { box.replaceChildren(); return; }
    const o = ARO.find((a) => a.icao === dep || a.local === dep);
    const n = F.normalize(cur);
    const dd = cur.date ? cur.date.slice(8, 10) + '/' + cur.date.slice(5, 7) : '';
    const subject = ['FPL', n.item7, (n.dep || '') + '-' + (n.dest || ''), dd, n.eobt ? n.eobt + 'Z' : ''].filter(Boolean).join(' ');
    const name = o && ((adByCode.get(o.icao) || {}).n || o.name);
    box.replaceChildren(
      h('div', { class: 'aro-title' }, t('aro.title')),
      o ? h('div', {},
        h('div', { class: 'aro-name' }, name + ' (' + o.icao + ')'),
        h('div', {}, copyable(o.email)),
        h('div', { class: 'aro-phones' }, o.phone.join(' · ')),
        h('div', {}, h('span', { class: 'muted' }, t('aro.subject') + ': '), copyable(subject)),
      ) : h('p', {}, t('aro.none')),
      h('p', { class: 'muted' }, t('aro.steps')),
    );
  }
  function copyable(text) {
    return h('button', { type: 'button', class: 'copy', title: t('p.copy'), onclick: () => copy(text) }, text);
  }
  function copy(text) {
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast(t('p.copied')), () => {});
  }

  function applyPlane(plane) {
    cur.planeId = plane ? plane.id : '';
    if (plane) Object.assign(cur, planeToFlight(plane));
    renderFlight();
  }
  function applyPilot(pilot) {
    cur.pilotId = pilot ? pilot.id : '';
    if (pilot) { cur.pic = pilot.name; cur.filedBy = pilot.name; cur._lastPic = pilot.name; }
    renderFlight();
  }

  function pdfInput() {
    const n = F.normalize(cur);
    const pilot = pilotOf();
    return {
      ...n, item18: F.item18(n),
      colour: F.norm(cur.colour), remarks: F.norm(cur.remarks), pic: F.norm(cur.pic), filedBy: F.norm(cur.filedBy),
      dinghies: { ...n.dinghies, number: F.norm(n.dinghies.number), capacity: F.norm(n.dinghies.capacity), colour: F.norm(n.dinghies.colour) },
      signature: pilot && pilot.signature && F.norm(pilot.name) === F.norm(cur.pic) ? pilot.signature : null,
    };
  }
  function showErrors() {
    showAll = true; refreshFlight();
    const r = flightForm.firstError();
    if (r) r.wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function makePdf() {
    if (Object.keys(F.validate(cur)).length) {
      showErrors();
      toast(t('msg.fixFirst'));
      return null;
    }
    if (!window.jspdf || !window.PDV_PDF) { toast(t('msg.pdfLib')); return null; }
    return window.PDV_PDF.render(pdfInput());
  }
  const pdfName = () => { const n = F.normalize(cur); return `FPL_${n.item7}_${F.dofFromDate(cur.date)}_${n.dep}-${n.dest}_${n.eobt}.pdf`; };

  function saveDraft() {
    const n = F.normalize(cur);
    const label = [n.item7, (n.dep || '?') + '→' + (n.dest || '?'), cur.date, n.eobt && n.eobt + 'Z'].filter(Boolean).join(' ');
    const d = { ...clone(cur), id: cur.draftId || S.uid(), label, savedAt: new Date().toISOString() };
    cur.draftId = d.id;
    const i = db.drafts.findIndex((x) => x.id === d.id);
    if (i >= 0) db.drafts[i] = d; else db.drafts.unshift(d);
    persist(); toast(t('msg.saved'));
  }
  function openDrafts() {
    const dlg = $('#dlg-drafts');
    const list = db.drafts.length ? db.drafts.map((d) => h('div', { class: 'row' },
      h('span', { class: 'mono' }, d.label),
      h('span', { class: 'row-actions' },
        h('button', { class: 'ghost small', onclick: () => {
          const { id, label, savedAt, ...flight } = clone(d);
          cur = { ...flight, draftId: id }; cur.date = cur.date < todayUTC() ? todayUTC() : cur.date; showAll = false; dlg.close(); renderFlight();
        } }, t('btn.load')),
        confirmBtn(() => { db.drafts = db.drafts.filter((x) => x.id !== d.id); persist(); openDrafts(); })))) : [h('p', { class: 'empty' }, t('empty.drafts'))];
    $('#drafts-body').replaceChildren(h('h3', {}, t('btn.drafts')), ...list,
      h('div', { class: 'dlg-actions' }, h('button', { class: 'ghost', onclick: () => dlg.close() }, t('btn.cancel'))));
    if (!dlg.open) dlg.showModal();
  }

  function confirmBtn(fn) {
    const b = h('button', { class: 'ghost small danger', type: 'button' }, t('btn.del'));
    b.addEventListener('click', () => {
      if (b.dataset.armed) return fn();
      b.dataset.armed = '1'; b.textContent = t('btn.confirmDel');
      setTimeout(() => { delete b.dataset.armed; b.textContent = t('btn.del'); }, 3000);
    });
    return b;
  }

  function renderPlanes() {
    const list = $('#plane-list');
    if (!db.planes.length) { list.replaceChildren(h('p', { class: 'empty' }, t('empty.planes'))); return; }
    list.replaceChildren(...db.planes.map((p) => h('div', { class: 'card' },
      h('div', { class: 'card-main' },
        h('div', { class: 'card-title mono' }, p.reg || '—'),
        h('div', { class: 'mono muted' }, [p.acType + '/' + p.wake, (p.eq10a || '') + '/' + (p.eq10b || ''), p.speed, p.endurance && 'E/' + p.endurance].filter(Boolean).join(' · ')),
        p.colour ? h('div', { class: 'muted' }, p.colour) : null),
      h('div', { class: 'row-actions' },
        h('button', { class: 'ghost small', onclick: () => editPlane(p) }, t('btn.edit')),
        h('button', { class: 'ghost small', onclick: () => editPlane({ ...clone(p), id: S.uid(), reg: '' }, true) }, t('btn.dup')),
        confirmBtn(() => { db.planes = db.planes.filter((x) => x.id !== p.id); persist(); renderPlanes(); renderSelects(); })))));
  }

  function editPlane(plane, isNew) {
    const p = clone(plane);
    const dlg = $('#dlg-plane'), form = $('#plane-form');
    let showAllP = false;
    const ui = buildForm(form, PLANE_SECTIONS, p, (path) => {
      if (path === 'acType') suggestWake(p, ui);
      ui.update(validatePlane(p), showAllP);
    });
    const save = () => {
      const e = validatePlane(p);
      if (!p.reg) e.reg = { es: 'Obligatorio', en: 'Required' };
      if (Object.keys(e).length) { showAllP = true; ui.update(e, true); return; }
      p.reg = F.norm(p.reg); p.acType = F.norm(p.acType);
      const i = db.planes.findIndex((x) => x.id === p.id);
      if (i >= 0) db.planes[i] = p; else db.planes.push(p);
      persist(); dlg.close(); renderPlanes();
      if (cur.planeId === p.id || !cur.planeId) applyPlane(p); else renderSelects();
      toast(t('msg.saved'));
    };
    form.onsubmit = (ev) => { ev.preventDefault(); save(); };
    form.prepend(h('h3', {}, isNew ? t('dlg.newPlane') : t('dlg.editPlane') + ' ' + plane.reg));
    form.append(h('div', { class: 'dlg-actions' },
      h('button', { class: 'ghost', type: 'button', onclick: () => dlg.close() }, t('btn.cancel')),
      h('button', { class: 'primary', type: 'submit' }, t('btn.save'))));
    ui.update(validatePlane(p), false);
    if (!dlg.open) dlg.showModal();
  }

  function renderPilots() {
    const list = $('#pilot-list');
    if (!db.pilots.length) { list.replaceChildren(h('p', { class: 'empty' }, t('empty.pilots'))); return; }
    list.replaceChildren(...db.pilots.map((p) => h('div', { class: 'card' },
      h('div', { class: 'card-main' },
        h('div', { class: 'card-title' }, p.name),
        p.signature ? h('img', { class: 'sig-thumb', src: p.signature, alt: '' }) : null),
      h('div', { class: 'row-actions' },
        h('button', { class: 'ghost small', onclick: () => editPilot(p) }, t('btn.edit')),
        confirmBtn(() => { db.pilots = db.pilots.filter((x) => x.id !== p.id); persist(); renderPilots(); renderSelects(); })))));
  }

  function editPilot(pilot) {
    const p = clone(pilot);
    const dlg = $('#dlg-pilot'), form = $('#pilot-form');
    const name = h('input', { type: 'text', value: p.name || '', id: 'pilot-name' });
    const err = h('small', { class: 'err' });
    const pad = signaturePad(p.signature);
    form.onsubmit = (ev) => { ev.preventDefault(); save(); };
    function save() {
      if (!name.value.trim()) { err.textContent = lang === 'es' ? 'Obligatorio' : 'Required'; return; }
      p.name = name.value.trim(); p.signature = pad.value();
      const i = db.pilots.findIndex((x) => x.id === p.id);
      if (i >= 0) db.pilots[i] = p; else db.pilots.push(p);
      persist(); dlg.close(); renderPilots();
      if (cur.pilotId === p.id || !cur.pilotId) applyPilot(p); else renderSelects();
      toast(t('msg.saved'));
    }
    form.replaceChildren(
      h('h3', {}, t('dlg.pilot')),
      h('div', { class: 'field wide' }, h('label', { for: 'pilot-name', class: 'lbl' }, t('f.name')), name, err),
      h('div', { class: 'field wide' }, h('span', { class: 'lbl' }, t('f.signature')), pad.el, h('small', { class: 'hint' }, t('h.signature'))),
      h('div', { class: 'dlg-actions' },
        h('button', { class: 'ghost', type: 'button', onclick: () => pad.clear() }, t('btn.clear')),
        h('button', { class: 'ghost', type: 'button', onclick: () => dlg.close() }, t('btn.cancel')),
        h('button', { class: 'primary', type: 'submit' }, t('btn.save'))));
    if (!dlg.open) dlg.showModal();
    name.focus();
  }

  function signaturePad(initial) {
    const c = h('canvas', { class: 'sig', width: 600, height: 200 });
    const ctx = c.getContext('2d');
    let dirty = !!initial, drawing = false, last;
    if (initial) { const img = new Image(); img.onload = () => ctx.drawImage(img, (600 - Math.min(600, img.width)) / 2, (200 - Math.min(200, img.height)) / 2, Math.min(600, img.width), Math.min(200, img.height)); img.src = initial; }
    const pos = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 200 / r.height]; };
    c.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = pos(e);
      ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#123';
      ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke();
      last = p; dirty = true;
    });
    c.addEventListener('pointerup', () => { drawing = false; });
    return {
      el: c,
      clear() { ctx.clearRect(0, 0, 600, 200); dirty = false; },
      value() {
        if (!dirty) return null;
        const d = ctx.getImageData(0, 0, 600, 200).data;
        let x0 = 600, y0 = 200, x1 = -1, y1 = -1;
        for (let y = 0; y < 200; y++) for (let x = 0; x < 600; x++) if (d[(y * 600 + x) * 4 + 3]) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        if (x1 < 0) return null;
        const out = h('canvas', { width: x1 - x0 + 9, height: y1 - y0 + 9 });
        out.getContext('2d').drawImage(c, x0 - 4, y0 - 4, x1 - x0 + 9, y1 - y0 + 9, 0, 0, x1 - x0 + 9, y1 - y0 + 9);
        return out.toDataURL('image/png');
      },
    };
  }

  function download(name, blob) {
    const a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function doExport() {
    download('pdv-gen-' + todayUTC().replace(/-/g, '') + '.json', new Blob([S.exportJson(db)], { type: 'application/json' }));
  }
  function doImport(file) {
    const dlg = $('#dlg-import');
    file.text().then((text) => {
      let data;
      try { data = S.parseImport(text); } catch (e) { toast(t('imp.bad')); return; }
      const apply = (mode) => {
        S.applyImport(db, data, mode); persist(); dlg.close();
        renderPlanes(); renderPilots(); renderFlight(); toast(t('msg.imported'));
      };
      $('#import-body').replaceChildren(
        h('h3', {}, t('imp.title')),
        h('p', {}, t('imp.found') + ': ' + data.planes.length + ' ' + t('n.planes') + ', ' + data.pilots.length + ' ' + t('n.pilots') + ', ' + data.drafts.length + ' ' + t('n.drafts') + '.'),
        h('div', { class: 'dlg-actions' },
          h('button', { class: 'ghost', onclick: () => dlg.close() }, t('btn.cancel')),
          h('button', { class: 'ghost danger', onclick: () => apply('replace') }, t('btn.replace')),
          h('button', { class: 'primary', onclick: () => apply('merge') }, t('btn.merge'))));
      dlg.showModal();
    });
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 2500);
  }
  function showTab(name) {
    for (const b of $$('[data-tab]')) b.setAttribute('aria-selected', String(b.dataset.tab === name));
    for (const s of $$('.tab')) s.hidden = s.id !== 'tab-' + name;
    document.body.dataset.tab = name;
    try { sessionStorage.setItem('pdvgen.tab', name); } catch (e) {}
  }
  function applyLang() {
    document.documentElement.lang = lang;
    for (const el of $$('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    $('#btn-lang').textContent = lang === 'es' ? 'EN' : 'ES';
    fillDatalists(); renderFlight(); renderPlanes(); renderPilots();
  }

  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
  $('#btn-lang').addEventListener('click', () => { lang = lang === 'es' ? 'en' : 'es'; db.lang = lang; persist(); applyLang(); });
  $('#sel-plane').addEventListener('change', (e) => applyPlane(db.planes.find((p) => p.id === e.target.value)));
  $('#sel-pilot').addEventListener('change', (e) => applyPilot(db.pilots.find((p) => p.id === e.target.value)));
  $('#btn-new').addEventListener('click', () => { cur = newFlight(planeOf(), pilotOf()); showAll = false; renderFlight(); });
  $('#btn-save-draft').addEventListener('click', saveDraft);
  $('#btn-drafts').addEventListener('click', openDrafts);
  $('#btn-copy').addEventListener('click', () => copy(F.message(cur) + '\n' + F.item19(F.normalize(cur))));
  $$('.btn-pdf').forEach((b) => b.addEventListener('click', () => { const d = makePdf(); if (d) d.save(pdfName()); }));
  $('#btn-view').addEventListener('click', () => { const d = makePdf(); if (d) window.open(d.output('bloburl'), '_blank'); });
  $('#btn-add-plane').addEventListener('click', () => editPlane(newPlane(), true));
  $('#btn-add-pilot').addEventListener('click', () => editPilot({ id: S.uid(), name: '', signature: null }));
  $('#btn-export').addEventListener('click', doExport);
  $('#btn-import').addEventListener('click', () => $('#file-import').click());
  $('#file-import').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) doImport(f); e.target.value = ''; });
  $$('.status').forEach((s) => s.addEventListener('click', showErrors));

  persist();
  applyLang();
  let tab = 'flight';
  try { tab = db.planes.length ? sessionStorage.getItem('pdvgen.tab') || 'flight' : 'planes'; } catch (e) {}
  showTab(tab);
})();

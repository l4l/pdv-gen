// Flight plan logic: normalisation, Item 18 composition, validation, FPL message.
// Rules: AIP SUP A 94/2024 (ENR 1.10) and PROGEN-ARO (Res. ANAC 35/2025). See DECISIONS.md D-017.
// Pure functions, no DOM. Works in the browser (window.PDV_FPL) and in node (module.exports).
(function (root) {
  'use strict';

  const EQ10A = ['N', 'S', 'A', 'B', 'C', 'D', 'E1', 'E2', 'E3', 'F', 'G', 'H', 'I',
    'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'K', 'L', 'M1', 'M2', 'M3', 'O',
    'P1', 'P2', 'P3', 'R', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const EQ10B = ['N', 'A', 'C', 'E', 'H', 'I', 'L', 'P', 'S', 'X', 'B1', 'B2', 'U1', 'U2', 'V1', 'V2', 'D1', 'G1'];
  const PBN = ['A1', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4',
    'L1', 'O1', 'O2', 'O3', 'O4', 'S1', 'S2', 'T1', 'T2'];
  const STS = ['ALTRV', 'ATFMX', 'FFR', 'FLTCK', 'HAZMAT', 'HEAD', 'HOSP', 'HUM', 'MARSA', 'MEDEVAC', 'NONRVSM', 'SAR', 'STATE'];

  // Item 18 indicators in Doc 4444 order; `key` is the flight-form field holding the value.
  const ITEM18 = [
    ['STS', 'sts'], ['PBN', 'pbn'], ['NAV', 'nav'], ['COM', 'com'], ['DAT', 'dat'], ['SUR', 'sur'],
    ['DEP', 'depName'], ['DEST', 'destName'], ['DOF', 'dof'], ['REG', 'reg'], ['EET', 'eet18'],
    ['SEL', 'sel'], ['TYP', 'typ'], ['CODE', 'code'], ['DLE', 'dle'], ['OPR', 'opr'], ['ORGN', 'orgn'],
    ['PER', 'per'], ['ALTN', 'altnName'], ['RALT', 'ralt'], ['TALT', 'talt'], ['RIF', 'rif'], ['RMK', 'rmk'],
  ];

  // Uppercase, strip accents (transmitted items are plain ITA-2/IA-5), collapse spaces.
  function norm(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toUpperCase().replace(/\s+/g, ' ').trim();
  }
  // Item 7: registration without hyphens or spaces (LV-ABC -> LVABC).
  function normId(s) { return norm(s).replace(/[^A-Z0-9]/g, ''); }

  // Split equipment strings like "SDE2FGY" into codes; two-char codes win when valid.
  function tokens(s, valid) {
    const out = [];
    for (let i = 0; i < s.length;) {
      const two = s.slice(i, i + 2);
      if (two.length === 2 && valid.includes(two)) { out.push(two); i += 2; } else { out.push(s[i]); i += 1; }
    }
    return out;
  }

  // YYYY-MM-DD -> YYMMDD
  function dofFromDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[1].slice(2) + m[2] + m[3] : '';
  }
  const isHHMM = (s) => /^([01]\d|2[0-3])[0-5]\d$/.test(s);
  const isDur = (s) => /^\d{2}[0-5]\d$/.test(s);
  const minutes = (s) => +s.slice(0, 2) * 60 + +s.slice(2);
  const isAd = (s) => /^[A-Z]{4}$/.test(s) || /^[A-Z0-9]{3}$/.test(s); // ICAO or national 3-letter (D-010)

  // Normalised copy of a flight form, ready for composition/PDF.
  function normalize(f) {
    const n = { ...f };
    n.item7 = normId(f.item7);
    for (const k of ['rules', 'flightType', 'number', 'acType', 'wake', 'eq10a', 'eq10b', 'dep', 'eobt', 'speed',
      'level', 'dest', 'eet', 'altn1', 'altn2', 'endurance', 'pob']) n[k] = norm(f[k]).replace(/ /g, '');
    for (const [, k] of ITEM18) if (k !== 'dof') n[k] = norm(f[k]);
    n.reg = normId(f.reg);
    n.route = norm(f.route);
    // DOF/ only when the flight is not today (UTC): required for advance filing (PROGEN-ARO), omitted otherwise (D-023).
    n.dof = f.date && f.date !== new Date().toISOString().slice(0, 10) ? dofFromDate(f.date) : '';
    if (/^\d{1,2}$/.test(n.pob)) n.pob = n.pob.padStart(3, '0');
    return n;
  }

  // Item 18 text: indicators in order, "0" when empty. Takes a normalised flight.
  function item18(n) {
    const parts = [];
    for (const [ind, key] of ITEM18) {
      let v = n[key];
      if (key === 'depName' && !['ZZZZ', 'AFIL'].includes(n.dep)) v = '';
      if (key === 'destName' && n.dest !== 'ZZZZ') v = '';
      if (key === 'altnName' && n.altn1 !== 'ZZZZ' && n.altn2 !== 'ZZZZ') v = '';
      if (key === 'reg' && v === n.item7) v = '';
      if (key === 'typ' && n.acType !== 'ZZZZ') v = '';
      if (v) parts.push(ind + '/' + v);
    }
    return parts.length ? parts.join(' ') : '0';
  }

  // Item 19 as transmitted in SPL messages (also used for the preview).
  function item19(n) {
    const p = [];
    if (n.endurance) p.push('E/' + n.endurance);
    if (n.pob) p.push('P/' + n.pob);
    const r = ['U', 'V', 'E'].filter((c) => n.radio && n.radio[c]).join('');
    if (r) p.push('R/' + r);
    if (n.survival && n.survival.any) p.push('S/' + ['P', 'D', 'M', 'J'].filter((c) => n.survival[c]).join(''));
    if (n.jackets && n.jackets.any) p.push('J/' + ['L', 'F', 'U', 'V'].filter((c) => n.jackets[c]).join(''));
    const d = n.dinghies;
    if (d && d.any) p.push(['D/' + norm(d.number), norm(d.capacity), d.cover ? 'C' : '', norm(d.colour)].filter(Boolean).join(' '));
    if (n.colour) p.push('A/' + norm(n.colour));
    if (n.remarks) p.push('N/' + norm(n.remarks));
    if (n.pic) p.push('C/' + norm(n.pic));
    return p.join(' ');
  }

  // ICAO FPL message (items 7–18), plus item 19 on a separate line for reference.
  function message(f) {
    const n = normalize(f);
    const eq = (n.eq10a || '') + '/' + (n.eq10b || '');
    const altn = [n.altn1, n.altn2].filter(Boolean).join(' ');
    return [
      '(FPL-' + n.item7 + '-' + n.rules + n.flightType,
      '-' + n.number + n.acType + '/' + n.wake + '-' + eq,
      '-' + n.dep + n.eobt,
      '-' + n.speed + n.level + ' ' + n.route,
      '-' + n.dest + n.eet + (altn ? ' ' + altn : ''),
      '-' + item18(n) + ')',
    ].join('\n');
  }

  // Validation. Returns { field: {es, en} }; empty object = valid. Errors block PDF (D-009).
  function validate(f) {
    const n = normalize(f);
    const e = {};
    const err = (k, es, en) => { if (!e[k]) e[k] = { es, en }; };
    const req = (k, es, en) => { if (!n[k]) err(k, 'Obligatorio', 'Required'); };
    const freeText = (k) => {
      if (/[-()\/]/.test(n[k] || '')) err(k, 'No usar - ( ) / en texto libre', 'Do not use - ( ) / in free text');
    };

    // Item 7
    if (!n.item7) req('item7');
    else if (!/^[A-Z0-9]{2,7}$/.test(n.item7)) err('item7', 'Máx. 7 letras/números, sin guiones', 'Max 7 letters/digits, no hyphens');
    const isReg = !/^[A-Z]{3}\d{1,4}[A-Z]?$/.test(n.item7); // not an airline designator + number

    // Item 8
    if (!/^[IVYZ]$/.test(n.rules)) err('rules', 'I, V, Y o Z', 'I, V, Y or Z');
    if (n.flightType && !/^[SNGMX]$/.test(n.flightType)) err('flightType', 'S, N, G, M o X', 'S, N, G, M or X');
    if (isReg && n.flightType && !/^[GMNX]$/.test(n.flightType))
      err('flightType', 'Con matrícula en casilla 7: G, M, N o X', 'With a registration in item 7: G, M, N or X');
    if ((n.rules === 'Y' || n.rules === 'Z') && !/ (VFR|IFR)( |$)/.test(n.route))
      err('route', 'Y/Z: indicar punto de cambio de reglas (… VFR / … IFR)', 'Y/Z: give the rule-change point (… VFR / … IFR)');

    // Item 9
    if (n.number && !/^([2-9]|[1-9]\d)$/.test(n.number)) err('number', 'Sólo si hay más de una aeronave (2–99)', 'Only for more than one aircraft (2–99)');
    if (!n.acType) req('acType');
    else if (!/^[A-Z][A-Z0-9]{1,3}$/.test(n.acType)) err('acType', 'Designador OACI de 2–4 caracteres o ZZZZ', '2–4 char ICAO designator or ZZZZ');
    if (n.acType === 'ZZZZ' && !n.typ) err('typ', 'ZZZZ requiere TYP/', 'ZZZZ requires TYP/');
    if (!/^[LMHJ]$/.test(n.wake)) err('wake', 'L, M, H o J', 'L, M, H or J');

    // Item 10
    const a = tokens(n.eq10a, EQ10A);
    if (!n.eq10a) req('eq10a');
    else if (a.some((t) => !EQ10A.includes(t))) err('eq10a', 'Código inválido: ' + a.filter((t) => !EQ10A.includes(t)).join(' '), 'Invalid code: ' + a.filter((t) => !EQ10A.includes(t)).join(' '));
    else if (a.includes('N') && a.length > 1) err('eq10a', 'N va sola', 'N must be alone');
    const b = tokens(n.eq10b, EQ10B);
    if (!n.eq10b) req('eq10b');
    else if (b.some((t) => !EQ10B.includes(t))) err('eq10b', 'Código inválido: ' + b.filter((t) => !EQ10B.includes(t)).join(' '), 'Invalid code: ' + b.filter((t) => !EQ10B.includes(t)).join(' '));
    else if (b.includes('N') && b.length > 1) err('eq10b', 'N va sola', 'N must be alone');
    else if (n.eq10b.length > 20) err('eq10b', 'Máx. 20 caracteres', 'Max 20 characters');
    if (a.includes('R') && !n.pbn) err('pbn', 'R en casilla 10 requiere PBN/', 'R in item 10 requires PBN/');
    if (a.includes('Z') && !n.nav && !n.com && !n.dat) err('nav', 'Z en casilla 10 requiere NAV/, COM/ o DAT/', 'Z in item 10 requires NAV/, COM/ or DAT/');

    // Item 13
    if (!n.dep) req('dep');
    else if (n.dep !== 'AFIL' && !isAd(n.dep)) err('dep', 'Indicador OACI (4), local (3) o ZZZZ', 'ICAO (4), local (3) or ZZZZ');
    if (['ZZZZ', 'AFIL'].includes(n.dep) && !n.depName) err('depName', 'ZZZZ/AFIL requiere DEP/', 'ZZZZ/AFIL requires DEP/');
    if (!isHHMM(n.eobt)) err('eobt', 'Hora UTC HHMM', 'UTC time HHMM');
    if (!f.date) err('date', 'Obligatorio', 'Required');

    // Item 15
    if (!/^(K\d{4}|N\d{4}|M\d{3})$/.test(n.speed)) err('speed', 'K0180, N0095 o M082', 'K0180, N0095 or M082');
    if (!/^(F\d{3}|A\d{3}|S\d{4}|M\d{4}|VFR)$/.test(n.level)) err('level', 'A045, F085, S1130, M0840 o VFR', 'A045, F085, S1130, M0840 or VFR');
    if (!n.route) err('route', 'Obligatorio (ej. DCT)', 'Required (e.g. DCT)');

    // Item 16
    if (!n.dest) req('dest');
    else if (!isAd(n.dest)) err('dest', 'Indicador OACI (4), local (3) o ZZZZ', 'ICAO (4), local (3) or ZZZZ');
    if (n.dest === 'ZZZZ' && !n.destName) err('destName', 'ZZZZ requiere DEST/', 'ZZZZ requires DEST/');
    if (!isDur(n.eet)) err('eet', 'Duración HHMM', 'Duration HHMM');
    for (const k of ['altn1', 'altn2']) if (n[k] && !isAd(n[k])) err(k, 'Indicador OACI (4), local (3) o ZZZZ', 'ICAO (4), local (3) or ZZZZ');
    if ((n.altn1 === 'ZZZZ' || n.altn2 === 'ZZZZ') && !n.altnName) err('altnName', 'ZZZZ requiere ALTN/', 'ZZZZ requires ALTN/');

    // Item 18
    if (n.sts && n.sts.split(' ').some((s) => !STS.includes(s))) err('sts', 'Valores: ' + STS.join(' '), 'Values: ' + STS.join(' '));
    if (n.pbn) {
      const p = n.pbn.replace(/ /g, '').match(/.{1,2}/g) || [];
      if (p.some((c) => !PBN.includes(c))) err('pbn', 'Códigos PBN inválidos', 'Invalid PBN codes');
      else if (p.length > 8) err('pbn', 'Máx. 8 códigos', 'Max 8 codes');
    }
    if (n.code && !/^[0-9A-F]{6}$/.test(n.code)) err('code', '6 caracteres hexadecimales', '6 hex characters');
    if (n.sel && !/^[A-Z]{4}$/.test(n.sel)) err('sel', '4 letras', '4 letters');
    if (n.per && !/^[A-EH]$/.test(n.per)) err('per', 'A–E o H', 'A–E or H');
    if (isReg && !n.opr) err('opr', 'Con matrícula en casilla 7 se requiere OPR/', 'OPR/ is required with a registration in item 7');
    if (!isReg && !n.reg) err('reg', 'Con designador de explotador se requiere REG/', 'REG/ is required with an operator designator');
    for (const k of ['depName', 'destName', 'altnName', 'opr', 'rmk', 'typ', 'nav', 'com', 'dat', 'sur', 'eet18', 'dle', 'rif', 'orgn', 'ralt', 'talt']) freeText(k);

    // Item 19
    if (!isDur(n.endurance)) err('endurance', 'Autonomía HHMM', 'Endurance HHMM');
    else if (isDur(n.eet) && minutes(n.endurance) <= minutes(n.eet))
      err('endurance', 'Debe ser mayor que la EET total', 'Must be greater than total EET');
    if (!/^(\d{1,3}|TBN)$/.test(n.pob)) err('pob', '1–999 o TBN', '1–999 or TBN');
    else if (n.pob !== 'TBN' && +n.pob < 1) err('pob', 'Al menos 1', 'At least 1');
    const d = n.dinghies || {};
    if (d.any) {
      if (!/^\d{1,2}$/.test(norm(d.number))) err('dNumber', '1–2 dígitos', '1–2 digits');
      if (!/^\d{1,3}$/.test(norm(d.capacity))) err('dCapacity', '1–3 dígitos', '1–3 digits');
      if (!norm(d.colour)) err('dColour', 'Obligatorio', 'Required');
    }
    if (!norm(n.colour)) err('colour', 'Obligatorio', 'Required');
    if (!norm(n.pic)) err('pic', 'Obligatorio', 'Required');
    return e;
  }

  const api = { tokens, EQ10A, EQ10B, PBN, STS, ITEM18, norm, normId, normalize, item18, item19, message, validate, dofFromDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PDV_FPL = api;
})(typeof window !== 'undefined' ? window : globalThis);

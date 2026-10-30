// Persistence in localStorage (D-002) plus JSON import/export. No backend (D-001).
(function () {
  'use strict';
  const KEY = 'pdvgen.v1';
  const FORMAT = 'pdv-gen';
  const VERSION = 1;

  const empty = () => ({ planes: [], pilots: [], drafts: [], current: null, lang: 'es' });
  let ok = true;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
    } catch (e) {
      ok = false;
      return empty();
    }
  }

  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); ok = true; } catch (e) { ok = false; }
    return ok;
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function exportJson(db) {
    return JSON.stringify({
      format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(),
      planes: db.planes, pilots: db.pilots, drafts: db.drafts,
    }, null, 2);
  }

  // Parse and sanity-check an export file. Throws on anything that isn't ours.
  function parseImport(text) {
    const d = JSON.parse(text);
    if (!d || d.format !== FORMAT || typeof d.version !== 'number') throw new Error('format');
    const list = (x) => (Array.isArray(x) ? x.filter((o) => o && typeof o === 'object' && typeof o.id === 'string') : []);
    return { planes: list(d.planes), pilots: list(d.pilots), drafts: list(d.drafts) };
  }

  // Merge replaces items with the same id and appends the rest; replace swaps the lists.
  function applyImport(db, data, mode) {
    for (const k of ['planes', 'pilots', 'drafts']) {
      if (mode === 'replace') { db[k] = data[k]; continue; }
      const byId = new Map(db[k].map((o) => [o.id, o]));
      for (const o of data[k]) byId.set(o.id, o);
      db[k] = [...byId.values()];
    }
    return db;
  }

  window.PDV_STORE = { load, save, uid, exportJson, parseImport, applyImport, get ok() { return ok; } };
})();

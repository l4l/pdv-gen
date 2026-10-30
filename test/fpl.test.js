// Run: node test/fpl.test.js
const assert = require('assert');
const F = require('../js/fpl.js');

const base = {
  item7: 'LV-ABC', rules: 'V', flightType: 'G', number: '', acType: 'c152', wake: 'L',
  eq10a: 'SDFGY', eq10b: 'C', dep: 'sadf', eobt: '1430', date: '2026-10-31',
  speed: 'N0095', level: 'A045', route: 'dct', dest: 'SAZR', eet: '0230', altn1: '', altn2: '',
  opr: 'Aeroclub San Fernando', rmk: '', endurance: '0430', pob: '2',
  radio: { U: false, V: true, E: true }, survival: { any: false }, jackets: { any: false },
  dinghies: { any: false }, colour: 'Blanco y rojo', remarks: '', pic: 'Juan Pérez',
};
const v = (o) => Object.keys(F.validate({ ...base, ...o }));

assert.deepStrictEqual(v({}), []);
assert.strictEqual(F.message(base),
  '(FPL-LVABC-VG\n-C152/L-SDFGY/C\n-SADF1430\n-N0095A045 DCT\n-SAZR0230\n-DOF/261031 OPR/AEROCLUB SAN FERNANDO)');
assert.strictEqual(F.item19(F.normalize(base)), 'E/0430 P/002 R/VE A/BLANCO Y ROJO C/JUAN PEREZ');

assert.deepStrictEqual(v({ item7: 'LVABCDEF' }), ['item7']);
assert.deepStrictEqual(v({ flightType: 'S' }), ['flightType']);           // registration needs G/M/N/X
assert.deepStrictEqual(v({ opr: '' }), ['opr']);
assert.deepStrictEqual(v({ endurance: '0230' }), ['endurance']);          // must exceed EET
assert.deepStrictEqual(v({ eq10a: 'SQ' }), ['eq10a']);
assert.deepStrictEqual(v({ eq10a: 'SDFGRY' }), ['pbn']);
assert.deepStrictEqual(v({ eq10a: 'SDFGRY', pbn: 'B2C2' }), []);
assert.deepStrictEqual(v({ dep: 'ZZZZ' }), ['depName']);
assert.deepStrictEqual(v({ dep: 'FDO' }), []);                            // national 3-letter accepted
assert.deepStrictEqual(v({ level: 'A45' }), ['level']);
assert.deepStrictEqual(v({ rules: 'Y' }), ['route']);
assert.deepStrictEqual(v({ rules: 'Y', route: 'DCT SAN VFR' }), []);
assert.deepStrictEqual(v({ acType: 'ZZZZ' }), ['typ']);
assert.deepStrictEqual(v({ rmk: 'TEL 11-1234' }), ['rmk']);
assert.deepStrictEqual(v({ eobt: '2460' }), ['eobt']);
assert.deepStrictEqual(v({ item7: 'ARG1766', flightType: 'S' }), ['reg']);

const z = F.normalize({ ...base, dep: 'ZZZZ', depName: 'Estancia La Paz', acType: 'ZZZZ', typ: 'ultraliviano', item7: 'ARG12', reg: 'LV-ABC' });
assert.strictEqual(F.item18(z), 'DEP/ESTANCIA LA PAZ DOF/261031 REG/LVABC TYP/ULTRALIVIANO OPR/AEROCLUB SAN FERNANDO');
assert.strictEqual(F.item18(F.normalize({ ...base, opr: '', date: '' })), '0');
console.log('ok');

/* eslint eqeqeq: [0] */

const mapValues = require('lodash.mapvalues');
const normalize = require('normalize-space');
// const moment = require('moment');

const KNOWN_BOOLS = [
  'CONVENIO_MODIFICATORIO',
  'CONTRATO_MARCO',
  'COMPRA_CONSOLIDADA',
  'PLURIANUAL',
];

const calendarFields = [
  'PROC_F_PUBLICACION',
  'FECHA_APERTURA_PROPOSICIONES',
  'FECHA_INICIO',
  'FECHA_FIN',
  'FECHA_CELEBRACION',
];

function valueMap(data) {
  return mapValues(data, (v, k) => {
    const n = +v;

    if (n) {
      return n;
    }
    if (calendarFields.indexOf(k) > -1) {
      return new Date(v);
    }
    if (KNOWN_BOOLS.indexOf(k) > -1) {
      // FIXME get the list of known_bools
      // from the comandline
      if (v == 0) {
        return false;
      }
      if (v == 1) {
        return true;
      }
    }
    return normalize(v.trim());
  });
}

module.exports = {
  valueMap,
};

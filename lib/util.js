const mapValues = require('lodash.mapvalues');
const normalize = require('normalize-space');

function valueMap(data) {
  return mapValues(data, v => {
    const n = +v;

    if (n) {
      return n;
    }
    if (v) {
      return normalize(v.trim());
    }
    return v;
  });
}


module.exports = {
  valueMap,
};

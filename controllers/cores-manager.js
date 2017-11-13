const os = require('os');
const debug = require('debug')('rscripts:server');

const _totalCores = os.cpus().length;
var _cores = os.cpus().length;

module.exports.getAvailableCores = () => {
  return _cores;
}

module.exports.requestCores = (coresToRequest) => {
  _cores -= coresToRequest;
  debug(coresToRequest + " cores requested. " + _cores + " available now.");
  return _cores;
}

module.exports.releaseCores = (coresToRelease) => {
  _cores += coresToRelease;
  debug(coresToRelease + " cores released. " + _cores + " available now.");
  return _cores;
}

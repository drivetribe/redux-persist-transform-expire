var reduxPersist = require('redux-persist');
var traverse = require('traverse');

var PERSIST_EXPIRE_DEFAULT_KEY = 'persistExpiresAt';

module.exports = function (config) {
  config = config || {};
  config.expireKey = config.expireKey || PERSIST_EXPIRE_DEFAULT_KEY;

  function dateToUnix (date) {
    return +(date.getTime() / 1000).toFixed(0);
  }

  function inbound (state) {
    if (!state) return state;

    return state;
  }

  function outbound (state) {
    if (!state) return state;

    var dateNow = dateToUnix(new Date())

    var validState = traverse(state).forEach(function (value) {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (!value.hasOwnProperty(config.expireKey)) {
        return;
      }

      var expireDate = value[config.expireKey];

      if (!expireDate) {
        return;
      }

      if (dateToUnix(new Date(expireDate)) < dateNow) {
        if (this.notRoot) {
          this.remove();
        } else {
          this.update(undefined);
        }
      }
    });

    return validState;
  }

  return reduxPersist.createTransform(inbound, outbound);
};

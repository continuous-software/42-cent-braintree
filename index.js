var Braintree42 = require('./lib/Braintree.js');
var braintree = require('braintree');

module.exports = {
  factory: function (merchantId, publicKey, privateKey, options) {
    var service = new Braintree42(options);
    options = options || {};
    Object.defineProperty(service, '_delegate', {
      value: braintree.connect({
        environment: options.testMode === true ? braintree.Environment.Sandbox : (process.env.NODE_ENV === 'production' ? braintree.Environment.Production : braintree.Environment.Development),
        merchantId: merchantId,
        publicKey: publicKey,
        privateKey: privateKey
      })
    });
    return service;
  },
  Braintree: Braintree42
};

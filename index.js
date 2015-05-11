var Braintree42 = require('./lib/Braintree.js');
var braintree = require('braintree');
var assert = require('assert');

module.exports = {
  factory: function (options) {
    assert(options.MERCHANT_ID,'MERCHANT_ID is mandatory');
    assert(options.PUBLIC_KEY,'PUBLIC_KEY is mandatory');
    assert(options.PRIVATE_KEY,'PRIVATE_KEY is mandatory');
    var service = new Braintree42(options);
    options = options || {};
    Object.defineProperty(service, '_delegate', {
      value: braintree.connect({
        environment: options.testMode === true ? braintree.Environment.Sandbox : (process.env.NODE_ENV === 'production' ? braintree.Environment.Production : braintree.Environment.Development),
        merchantId: options.MERCHANT_ID,
        publicKey: options.PUBLIC_KEY,
        privateKey: options.PRIVATE_KEY
      })
    });
    return service;
  },
  Braintree: Braintree42
};

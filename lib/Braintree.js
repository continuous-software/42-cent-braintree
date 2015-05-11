var BaseGateway = require('42-cent-base').BaseGateway;
var GatewayError = require('42-cent-base').GatewayError;
var util = require('util');
var P = require('bluebird');
var mapKeys = require('42-cent-util').mapKeys;
var assign = require('object-assign');

var creditCardSchema = {
  creditCardNumber: 'number',
  expirationMonth: 'expirationMonth',
  expirationYear: 'expirationYear',
  cvv2: 'cvv',
  cardHolder: 'cardHolderName'
};

var billingSchema = {
  billingFirstName: 'firstName',
  billingLastName: 'lastName',
  billingAddress1: 'streetAddress',
  billingAddress2: 'extendedAddress',
  billingCity: 'locality',
  billingStateRegion: 'region',
  billingCountry: 'countryCodeAlpha2',
  billingPostalCode: 'postalCode'
};

var shippingSchema = {
  shippingFirstName: 'firstName',
  shippingLastName: 'lastName',
  shippingAddress1: 'streetAddress',
  shippingAddress2: 'extendedAddress',
  shippingCity: 'locality',
  shippingStateRegion: 'region',
  shippingCountry: 'countryCodeAlpha2',
  shippingPostalCode: 'postalCode'
};

var customerSchema = {
  billingFirstName: 'firstName',
  billingLastName: 'lastName',
  billingPhone: 'phone',
  billingEmailAddress: 'email'
};

function Braintree42 (options) {
  BaseGateway.call(this, options);
}

util.inherits(Braintree42, BaseGateway);

function parseError (resp) {
  if (resp.success === false) {
    throw new GatewayError(resp.message || 'Remote error', resp);
  }
}

Braintree42.prototype.submitTransaction = function submitTransaction (order, creditcard, prospect, other) {
  var delegate = this._delegate;
  var sale = P.promisify(delegate.transaction.sale).bind(delegate.transaction);

  order.amount = (+order.amount).toFixed(2);

  order = assign(order, {
    billing: mapKeys(prospect, billingSchema),
    shipping: mapKeys(prospect, shippingSchema),
    customer: mapKeys(prospect, customerSchema),
    creditCard: mapKeys(creditcard, creditCardSchema),
    options: {
      submitForSettlement: true
    }
  }, other || {});

  return sale(order)
    .then(function (resp) {
      parseError(resp);
      return {
        _original: resp,
        transactionId: resp.transaction.id,
        authCode: resp.transaction.processorAuthorizationCode
      };
    });

};

Braintree42.prototype.authorizeTransaction = function authorizeTransaction (order, credicard, prospect, other) {
  return this.submitTransaction(order, credicard, prospect, assign(other || {}, {options: {submitForSettlement: false}}));
};

Braintree42.prototype.refundTransaction = function refundTransaction (transactionId, options) {
  var delegate = this._delegate;
  var refund = P.promisify(delegate.transaction.refund).bind(delegate.transaction);
  var args = [transactionId];
  options = options || {};
  if (options.amount) {
    args.push((+options.amount).toFixed(2));
  }
  return refund.apply(delegate.transaction, args)
    .then(function (resp) {
      parseError(resp);
      return {
        _original: resp
      };
    });
};

Braintree42.prototype.voidTransaction = function voidTransaction (transactionId, options) {
  var delegate = this._delegate;
  var voidFunc = P.promisify(delegate.transaction.void).bind(delegate.transaction);
  if (options) {
    console.warn('void options is not supported for this gateway');
  }

  return voidFunc(transactionId)
    .then(function (resp) {
      parseError(resp);
      return {
        _original: resp
      };
    });
};

Braintree42.prototype.createCustomerProfile = function createCustomerProfile (payment, billing, shipping, other) {
  var delegate = this._delegate;
  var create = P.promisify(delegate.customer.create).bind(delegate.customer);
  var payload = assign({}, {
    creditCard: assign(mapKeys(payment, creditCardSchema), {billingAddress: mapKeys(billing, billingSchema)})
  });

  return create(payload)
    .then(function (resp) {
      parseError(resp);
      return {
        profileId: resp.customer.id,
        _original: resp
      };
    });
};

Braintree42.prototype.chargeCustomer = function chargeCustomer (order, prospect, other) {
  var delegate = this._delegate;
  var sale = P.promisify(delegate.transaction.sale).bind(delegate.transaction);

  order.amount = (+order.amount).toFixed(2);
  order.customerId = prospect.profileId;

  order = assign(order, {
    options: {
      submitForSettlement: true
    }
  }, other || {});

  return sale(order)
    .then(function (resp) {
      parseError(resp);
      return {
        _original: resp,
        transactionId: resp.transaction.id,
        authCode: resp.transaction.processorAuthorizationCode
      };
    });
};


module.exports = Braintree42;
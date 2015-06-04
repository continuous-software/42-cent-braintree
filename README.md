[![Build Status](https://travis-ci.org/continuous-software/42-cent-braintree.svg?branch=master)](https://travis-ci.org/continuous-software/42-cent-braintree)

![42-cent-braintree](http://upload.wikimedia.org/wikipedia/commons/9/93/Braintree_logo_small.png)

## Installation ##

    $ npm install -s 42-cent-braintree

## Usage

```javascript
var Braintree = require('42-cent-braintree');
var client = new Braintree({
    MERCHANT_ID: '<PLACEHOLDER>',
    PUBLIC_KEY: '<PLACEHOLDER>',
    PRIVATE_KEY: '<PLACEHOLDER>'
});
```

## Gateway API

This is an adaptor of [braintree_node](https://github.com/braintree/braintree_node) for [42-cent](https://github.com/continuous-software/42-cent).  
It implements the [BaseGateway](https://github.com/continuous-software/42-cent-base) API.

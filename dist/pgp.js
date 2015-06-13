(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/basti/src/remotestorage/modules/src/pgp.js":[function(require,module,exports){
/**
 * File: PGP
 *
 * Maintainer: - Niklas E. Cathor <nilclass@riseup.net>
 * Version:    - 0.0.0
 *
 * This module can manage public and private PGP keys.
 *
 * As of the writing of this module, I would not recommend putting private PGP keys
 * into your remotestorage without prior evaluation of risks and consequences.
 *
 */
"use strict";

RemoteStorage.defineModule("pgp", function (privateClient) {

  var PUBLIC_KEYS_PATH = "keys/pub/",
      PRIVATE_KEYS_PATH = "keys/priv/";

  return {
    types: {
      key: {
        schema: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string"
            },
            data: {
              type: "string"
            },
            subkeys: {
              type: "array",
              items: {
                type: "object",
                schema: "key"
              }
            }
          }
        }
      }
    },
    exports: {

      listPublicKeys: function listPublicKeys() {
        return privateClient.getListing(PUBLIC_KEYS_PATH);
      },

      listPrivateKeys: function listPrivateKeys() {
        return privateClient.getListing(PRIVATE_KEYS_PATH);
      },

      getPublicKey: function getPublicKey(keyid) {
        return privateClient.getObject(PUBLIC_KEYS_PATH + keyid);
      },

      getPrivateKey: function getPrivateKey(keyid) {
        return privateClient.getObject(PRIVATE_KEYS_PATH + keyid);
      },

      getKeypair: function getKeypair(keyid) {
        // FIXME: promising is no longer available from rs.js 0.10.3,
        // hage to change this to bluebird:
        return promising((function (p) {
          var i = 0;
          var result = {};
          function setter(key) {
            return function (value) {
              result[key] = value;
              i++;if (i == 2) p.fulfill(result);
            };
          }
          this.getPublicKey(keyid).then(setter("pub"));
          this.getPrivateKey(keyid).then(setter("priv"));
        }).bind(this));
      }

    }
  };
});

},{}]},{},["/home/basti/src/remotestorage/modules/src/pgp.js"]);

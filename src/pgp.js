/**
 * File: PGP
 *
 * Maintainer: - Niklas E. Cathor <nilclass@riseup.net>
 * Version:    - 0.0.0
 *
 *
 * This module can manage public and private PGP keys.
 *
 * As of the writing of this module, I would not recommend putting private PGP keys
 * into your remotestorage without prior evaluation of risks and consequences.
 *
 */
RemoteStorage.defineModule('pgp', function(privateClient) {

  var PUBLIC_KEYS_PATH = "keys/pub/", PRIVATE_KEYS_PATH = "keys/priv/";

  return {
    types: {
      key: {
        schema: {
          "type": "object",
          "required": ["id"],
          "properties": {
            "id": {
              "type": "string"
            },
            "data": {
              "type": "string"
            },
            "subkeys": {
              "type": "array",
              "items": {
                "type": "object",
                "schema": "key"
              }
            }
          }
        }
      }
    },
    exports: {

      listPublicKeys: function() {
        return privateClient.getListing(PUBLIC_KEYS_PATH);
      },

      listPrivateKeys: function() {
        return privateClient.getListing(PRIVATE_KEYS_PATH);
      },

      getPublicKey: function(keyid) {
        return privateClient.getObject(PUBLIC_KEYS_PATH + keyid);
      },

      getPrivateKey: function(keyid) {
        return privateClient.getObject(PRIVATE_KEYS_PATH + keyid);
      },

      getKeypair: function(keyid) {
        return Promise(function(p) {
          var i = 0;
          var result = {};
          function setter(key) {
            return function(value) {
              result[key] = value;
              i++; if(i == 2) p.fulfill(result);
            }
          }
          this.getPublicKey(keyid).then(setter('pub'));
          this.getPrivateKey(keyid).then(setter('priv'));
        }.bind(this));
      }

    }
  }

});

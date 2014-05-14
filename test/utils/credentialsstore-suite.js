require('./test/dependencies');

requireAndLoad('./src/utils/credentialsstore', 'CredentialsStore');

define(['require'], function(require) {

  var suites = [];

  suites.push({
    desc: 'CredentialsStore suite',
    setup: function (env, test) {
      env.baseClient = {
        on: function(eventName, handler) { env.handlers[eventName].push(handler);}
      };
      env.responses = {};
      env.handlers = {
        change: []
      };

      function mock(obj, functionName) {
        obj[functionName] = function() {
          var i, input = [functionName].concat(Array.prototype.slice.call(arguments));
          if (!env.responses[input]) {
            console.log('MISSING (or falsy) RESPONSE', input, Object.keys(env.responses));
          }
          env.called.push(input);
          if (env.responses[input] === 'ERROR') {
            throw new Error('mock error');
          }
          return env.responses[input];
        };
      }
      mock(env.baseClient, 'getFile');
      mock(env.baseClient, 'storeFile');
      mock(env.baseClient, 'validate');
      global.sjcl = {
      };
      mock(global.sjcl, 'encrypt');
      mock(global.sjcl, 'decrypt');
      env.credentialsStore = new CredentialsStore('foo', env.baseClient);
      test.done();
    },
    tests: [

      {
        desc: "set and get, no encryption",
        run: function (env, test) {
          var storeFilePromise = promising(), getFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }] ] = { valid: true };
          env.responses[ ['storeFile', 'application/json', 'foo-config',
              JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' })] ] = storeFilePromise;
          env.responses[ ['getFile', 'foo-config', false] ] = getFilePromise;
          
          env.credentialsStore.setConfig(undefined, {some: 'conf'}).then(function() {
            return env.credentialsStore.getConfig(undefined);
          }).then(function(res) {
            test.assertAnd(res, {some: 'conf'});
            test.assertAnd(env.called, [ 
             [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ],
             [ 'storeFile', 'application/json', 'foo-config', '{"some":"conf","@context":"http://remotestorage.io/spec/modules/foo/config"}' ],
             [ 'getFile', 'foo-config', false ] 
            ]);
            test.done();
          });
          storeFilePromise.fulfill({});
          getFilePromise.fulfill({
            data: JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }),
            mimeType: 'application/json'
          });
        }
      },

      {
        desc: "set and get, with encryption",
        run: function (env, test) {
          var storeFilePromise = promising(), getFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ] ] = { valid: true };
          env.responses[ [ 'encrypt', 'my secret',
              JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }) ] ] = 'crypto-crypto';
          env.responses[ [ 'storeFile', 'application/json', 'foo-config', 'AES-CCM-128:crypto-crypto' ] ] = storeFilePromise;
          env.responses[ [ 'getFile', 'foo-config', false ] ] = getFilePromise;
          env.responses[ [ 'decrypt', 'my secret', 'crypto-crypto' ] ] =
              JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' });
          
          env.credentialsStore.setConfig('my secret', {some: 'conf'}).then(function() {
            return env.credentialsStore.getConfig('my secret');
          }).then(function(res) {
            test.assertAnd(res, {some: 'conf'});
            test.assertAnd(env.called, [
             [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ],
             [ 'encrypt', 'my secret', JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }) ],
             [ 'storeFile', 'application/json', 'foo-config', 'AES-CCM-128:crypto-crypto' ],
             [ 'getFile', 'foo-config', false ],
             [ 'decrypt', 'my secret', 'crypto-crypto' ]
            ]);
            test.done();
          });
          storeFilePromise.fulfill({});
          getFilePromise.fulfill({
            data: 'AES-CCM-128:crypto-crypto',
            mimeType: 'application/json'
          });
        }
      },

      {
        desc: "set and get, with encryption, wrong password",
        run: function (env, test) {
          var storeFilePromise = promising(), getFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ] ] = { valid: true };
          env.responses[ [ 'encrypt', 'my secret',
              JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }) ] ] = 'crypto-crypto';
          env.responses[ [ 'storeFile', 'application/json', 'foo-config', 'AES-CCM-128:crypto-crypto' ] ] = storeFilePromise;
          env.responses[ [ 'getFile', 'foo-config', false ] ] = getFilePromise;
          env.responses[ [ 'decrypt', 'not my secret', 'crypto-crypto' ] ] = 'ERROR';
          
          env.credentialsStore.setConfig('my secret', {some: 'conf'}).then(function() {
            return env.credentialsStore.getConfig('not my secret');
          }).then(function() {
            test.result(false, 'getConfig should have failed here');
          }, function(err) {
            test.assertAnd(err, 'could not decrypt foo-config with that password');
            test.assertAnd(env.called, [
             [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ],
             [ 'encrypt', 'my secret', JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }) ],
             [ 'storeFile', 'application/json', 'foo-config', 'AES-CCM-128:crypto-crypto' ],
             [ 'getFile', 'foo-config', false ],
             [ 'decrypt', 'not my secret', 'crypto-crypto' ]
            ]);
            test.done();
          });
          storeFilePromise.fulfill({});
          getFilePromise.fulfill({
            data: 'AES-CCM-128:crypto-crypto',
            mimeType: 'application/json'
          });
        }
      },

      {
        desc: "set without encryption and get with encryption",
        run: function (env, test) {
          var storeFilePromise = promising(), getFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ] ] = { valid: true };
          env.responses[ [ 'storeFile', 'application/json', 'foo-config',
             JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }) ] ] = storeFilePromise;
          env.responses[ [ 'getFile', 'foo-config', false ] ] = getFilePromise;
          
          env.credentialsStore.setConfig(undefined, {some: 'conf'}).then(function() {
            return env.credentialsStore.getConfig('my secret');
          }).then(function() {
            test.result(false, 'getConfig should have failed here');
          }, function(err) {
            test.assertAnd(err, 'foo-config is not encrypted, or encrypted with a different algorithm');
            test.assertAnd(env.called, [
             [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ],
             [ 'storeFile', 'application/json', 'foo-config', JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }) ],
             [ 'getFile', 'foo-config', false ]
            ]);
            test.done();
          });
          storeFilePromise.fulfill({});
          getFilePromise.fulfill({
            data: JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }),
            mimeType: 'application/json'
          });
        }
      },

      {
        desc: "set with encryption and get without encryption",
        run: function (env, test) {
          var storeFilePromise = promising(), getFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ] ] = { valid: true };
          env.responses[ [ 'encrypt', 'my secret',
              JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }) ] ] = 'crypto-crypto';
          env.responses[ [ 'storeFile', 'application/json', 'foo-config', 'AES-CCM-128:crypto-crypto' ] ] = storeFilePromise;
          env.responses[ [ 'getFile', 'foo-config', false ] ] = getFilePromise;
          
          env.credentialsStore.setConfig('my secret', {some: 'conf'}).then(function() {
            return env.credentialsStore.getConfig();
          }).then(function() {
            test.result(false, 'getConfig should have failed here');
          }, function(err) {
            test.assertAnd(err, 'foo-config is encrypted, please specify a password for decryption');
            test.assertAnd(env.called, [
             [ 'validate', { some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' } ],
             [ 'encrypt', 'my secret', JSON.stringify({some: 'conf', '@context': 'http://remotestorage.io/spec/modules/foo/config' }) ],
             [ 'storeFile', 'application/json', 'foo-config', 'AES-CCM-128:crypto-crypto' ],
             [ 'getFile', 'foo-config', false ]
            ]);
            test.done();
          });
          storeFilePromise.fulfill({});
          getFilePromise.fulfill({
            data: 'AES-CCM-128:crypto-crypto',
            mimeType: 'application/json'
          });
        }
      },

      {
        desc: "incoming updates",
        run: function (env, test) {
          env.called = [];
          env.responses = {};
          env.credentialsStore.on('change', function(evt) {
            test.assertAnd(evt, undefined);
            test.assertAnd(env.called, []);
            test.done();
          });
          env.handlers['change'][0]({
            origin: 'remote',
            path: 'foo-config',
            newValue: 'incoming value',
            newContentType: 'incoming content type'
          });
        }
      }
  //TODO: test with encryption
  //TODO: test get garbage without encryption
  //TODO: test get garbage with encryption
  //TODO: test get encrypted without encryption
  //TODO: test get clear with encryption
  //TODO: test get wrong pass with encryption
  //TODO: test that it throws exactly the errors mentioned in the docs
    ]

  });

  return suites;
});

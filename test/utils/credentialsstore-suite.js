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

/*      {
        desc: "incoming updates",
        run: function (env, test) {
          env.called = [];
          env.responses = {};
          env.handlers['change'] = [];
          env.credentialsStore.on('change', function(evt) {
            test.assertAnd(evt, {
              key: 'foo',
              origin: 'remote',
              relativePath: '/_oo',
              newValue: 'incoming value',
              newContentType: 'incoming content type'
            });
            test.assertAnd(env.called, []);
            test.done();
          });
          env.handlers['change'][0]({
            origin: 'remote',
            relativePath: 'f/_oo',
            newValue: 'incoming value',
            newContentType: 'incoming content type'
          });
        }
      }*/
  //TODO: test with encryption
  //TODO: test get garbage without encryption
  //TODO: test get garbage with encryption
  //TODO: test get encrypted without encryption
  //TODO: test get clear with encryption
  //TODO: test get wrong pass with encryption
    ]

  });

  return suites;
});

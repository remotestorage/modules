require('./test/dependencies');

requireAndLoad('./src/utils/prefixtree', 'PrefixTree');

define(['require'], function(require) {

  var suites = [];

  suites.push({
    desc: 'PrefixTree suite',
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
      mock(env.baseClient, 'getListing');
      
      env.prefixTree = new PrefixTree(env.baseClient);
      test.done();
    },
    tests: [

      {
        desc: "storeFile",
        run: function (env, test) {
          var getListingPromise = promising(), storeFilePromise = promising();
          env.called = [];
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ] = storeFilePromise;
          env.prefixTree.storeFile('text/plain;charset=utf-8', 'foo', 'bar').then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ]);
            test.done();
          });
          
          getListingPromise.fulfill({});
          storeFilePromise.fulfill();
        }
      },

      {
        desc: "getFile",
        run: function (env, test) {
          var getFilePromise = promising(), getListingPromise = promising();
          env.called = [];
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['getFile', 'f/_oo', false] ] = getFilePromise;
          
          env.prefixTree.getFile('foo').then(function(res) {
            test.assertAnd(res.data, 'baseClient value');
            test.assertAnd(env.called, [ [ 'getListing', 'f/', false ], [ 'getFile', 'f/_oo', false ] ]);
            test.done();
          });
          getListingPromise.fulfill({});
          getFilePromise.fulfill({
            data: 'baseClient value',
            mimeType: 'baseClient content type'
          });
        }
      },

      {
        desc: "incoming updates",
        run: function (env, test) {
          env.called = [];
          env.prefixTree.on('change', function(evt) {
            test.assertAnd(evt, {
              key: 'foo',
              origin: 'remote',
              relativePath: 'f/_oo',
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
      }
    ]

  });

  return suites;
});

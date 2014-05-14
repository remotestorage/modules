require('./test/dependencies');

requireAndLoad('./src/utils/syncedmap', 'SyncedMap');

define(['require'], function(require) {

  var suites = [];

  suites.push({
    desc: 'SyncedMap suite',
    setup: function (env, test) {
      env.prefixTree = {
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
      
      tmp = global.PrefixTree;
      global.PrefixTree = function() {
        this.constructionArgs = arguments;
        env.prefixTree = this;
        mock(this, 'getFile');
        mock(this, 'storeFile');
        mock(this, 'getObject');
        mock(this, 'storeObject');
        mock(this, 'remove');
        mock(this, 'getListing');
      }
      global.PrefixTree.prototype.on = function(eventName, handler) { env.handlers[eventName].push(handler);}
      env.syncedMap = new SyncedMap('foo', {
        scope: function(path) {
          return 'fake BaseClient scoped to '+path;
        }
      });
      global.PrefixTree = tmp;

      test.done();
    },
    tests: [

      {
        desc: "constructor",
        run: function (env, test) {
          test.assertAnd(env.prefixTree.constructionArgs, {'0': 'fake BaseClient scoped to foo/'});
          test.done();
        }
      },

      {
        desc: "load",
        run: function (env, test) {
          env.called = [];
          env.responses = {};
          env.responses[ ['fireInitial'] ] = true;

          env.syncedMap.load();
          setTimeout(function() {
            test.assertAnd(env.called, [ [ 'fireInitial']]);
            test.done();
          }, 10);
        }
      },

      {
        desc: "get, set, get",
        run: function (env, test) {
          var storeFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['storeFile', 'application/json', 'some key', JSON.stringify({bla: 17})] ] = storeFilePromise;
          
          test.assertAnd(env.syncedMap.get('some key'), undefined);
          env.syncedMap.set('some key', {bla: 17});
          test.assertAnd(env.syncedMap.get('some key'), {bla: 17});
          storeFilePromise.fulfill({});
          setTimeout(function() {
            test.assertAnd(env.called, [ [ 'storeFile', 'application/json', 'some key', '{"bla":17}' ] ]);
            test.done();
          }, 10);
        }
      },

      {
        desc: "get, remove, get",
        run: function (env, test) {
          var storeFilePromise = promising(), removePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['storeFile', 'application/json', 'some key', JSON.stringify({bla: 17})] ] = storeFilePromise;
          env.responses[ ['remove', 'some key'] ] = removePromise;
          
          env.syncedMap.set('some key', {bla: 17});
          test.assertAnd(env.syncedMap.get('some key'), {bla: 17});
          env.syncedMap.remove('some key');
          test.assertAnd(env.syncedMap.get('some key'), undefined);
          storeFilePromise.fulfill({});
          removePromise.fulfill({});
          setTimeout(function() {
            test.assertAnd(env.called, [ [ 'storeFile', 'application/json', 'some key', '{"bla":17}' ], ['remove', 'some key']]);
            test.done();
          }, 10);
        }
      },

      {
        desc: "getKeys, set, getKeys",
        run: function (env, test) {
          var storeFilePromise1 = promising(), storeFilePromise2 = promising(), storeFilePromise3 = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['storeFile', 'application/json', 'some key', JSON.stringify({bla: 17})] ] = storeFilePromise1;
          env.responses[ ['storeFile', 'application/json', 'some key', JSON.stringify({bla: 18})] ] = storeFilePromise2;
          env.responses[ ['storeFile', 'application/json', 'some other key', JSON.stringify({bla: 19})] ] = storeFilePromise3;
          
          test.assertAnd(env.syncedMap.getKeys(), []);
          env.syncedMap.set('some key', {bla: 17});
          env.syncedMap.set('some key', {bla: 18});
          env.syncedMap.set('some other key', {bla: 19});
          test.assertAnd(env.syncedMap.getKeys(), ['some other key', 'some key']);
          storeFilePromise1.fulfill({});
          storeFilePromise2.fulfill({});
          storeFilePromise3.fulfill({});
          setTimeout(function() {
            test.assertAnd(env.called, [
              [ 'storeFile', 'application/json', 'some key', '{"bla":17}' ],
              [ 'storeFile', 'application/json', 'some key', '{"bla":18}' ],
              [ 'storeFile', 'application/json', 'some other key', '{"bla":19}' ]
            ]);
            test.done();
          }, 10);
        }
      }
    ]

  });

  return suites;
});

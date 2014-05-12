require('./test/dependencies');

requireAndLoad('./src/utils/prefixtree', 'PrefixTree');
requireAndLoad('./src/utils/syncedmap', 'SyncedMap');

define(['require'], function(require) {

  var suites = [];

  suites.push({
    desc: 'SyncedMap',
    setup: function (env, test) {
      console.log(SyncedMap, PrefixTree);
      env.baseClient = {
        on: function() {},
        scope: function() {
          return {
            on: function() {},
            getListing: function(path, maxAge) {
              return env.responses[['getListing', path, maxAge]];
            }
          };
        }
      };
      env.syncedMap = new SyncedMap('foo', env.baseClient);
      test.done();
    },
    tests: [

      {
        desc: "load, set, get",
        run: function (env, test) {
          var res;
          console.log('syncedMap', env.syncedMap);
          test.done();//TODO: write some tests here
          env.syncedMap.load();
          env.syncedMap.set('a', 'b');
          res = env.syncedMap.get('a');
          test.assertAnd(res, 'b');
          test.done();
        }
      }
    ]

  });

  return suites;
});

require('./test/dependencies');

requireAndLoad('./src/utils/syncedvar', 'SyncedVar');
console.log(jaribuReuse);

define(['require'], function(require) {

  var suites = [];

  suites.push({
    desc: 'SyncedVar suite',
    setup: function (env, test) {
      //console.log(SyncedVar);
      env.baseClient = {
        getListing: function(path, maxAge) { return env.responses[['getListing', path, maxAge]]; },
        on: function() {}
      };
      env.syncedVar = new SyncedVar('foo', env.baseClient);
      test.done();
    },
    tests: [

      {
        desc: "load, set, get",
        run: function (env, test) {
          var res;
          console.log('syncedVar', env.syncedVar);
  test.done();        env.syncedVar.load();
          env.syncedVar.set('b');
          res = env.syncedVar.get();
          test.assertAnd(res, 'b');
          test.done();
        }
      }
    ]

  });

  return suites;
});

if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}
define(['require', 'bluebird', 'remotestoragejs'], function (require, Promise, RemoteStorage) {
  var suites = [];

  suites.push({
    desc: '# fitness.bodyMeasurement',
    setup: function (env, test) {
      global.remoteStorage = new RemoteStorage();
      require('./../src/fitness');
      remoteStorage.access.claim('fitness', 'rw');
      env.fitness = remoteStorage.fitness;
      env.schemas = {
        bad: [
          {
            pounds: 123
          },
          {
            clothing: {
              pant_size: 38
            },
            weight: 250,
            height: "really tall"
          }
        ],
        good: [
          {
            height: 210,
            clothing: {
              dress_size: 5
            },
            thigh_size: 44
          },
          {
            height: 270
          }
        ]
      };

      test.assertType(remoteStorage.fitness, 'object');
    },
    tests: [

      {
        desc: "# fitness.bodyMeasurement.getAll returns empty object",
        run: function (env, test) {
          env. fitness.bodyMeasurement.getAll().then(function (fitness) {
            test.assert(fitness, {});
          }, test.fail);
        }
      },

      {
        desc: "# fitness.bodyMeasurement.add bad[0]",
        willFail: true,
        run: function (env, test) {
          return env. fitness.bodyMeasurement.add(env.schemas.bad[0]);
        }
      },
      {
        desc: "# fitness.bodyMeasurement.add bad[1]",
        willFail: true,
        run: function (env, test) {
          return env. fitness.bodyMeasurement.add(env.schemas.bad[1]);
        }
      },

      {
        desc: "# fitness.bodyMeasurement.getListing ",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.getListing().then(function (l) {
            test.assertTypeAnd(l, 'object');
            var expected = {};
            test.assert(l, expected);
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.add good[0]",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.add(env.schemas.good[0]).then(function (f) {
            env.schemas.good[0] = f;
            test.assertType(f.id, 'string');
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.add good[1]",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.add(env.schemas.good[1]).then(function (f) {
            env.schemas.good[1] = f;
            test.assertType(f.id, 'string');
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.get good[0]",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.get(env.schemas.good[0].id).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[0].id);
            test.assert(f.region, env.schemas.good[0].region);
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.get (verify update) good[0]",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.get(env.schemas.good[0].id).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[0].id);
            test.assert(f.region, env.schemas.good[0].region);
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.getListing ",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.getListing().then(function (l) {
            test.assertTypeAnd(l, 'object');
            var expected = {};
            expected[env.schemas.good[0].id] = true;
            expected[env.schemas.good[1].id] = true;
            test.assert(l, expected);
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.getAll (two records)",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.getAll().then(function (fitness) {
            test.assertTypeAnd(fitness, 'object');
            test.assertType(fitness[env.schemas.good[1].id], 'object');
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.delete good[0]",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.remove(env.schemas.good[0].id);
        }
      },

      {
        desc: "# fitness.bodyMeasurement.get good[0]",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.get(env.schemas.good[0].id).then(function (f) {
            test.assert(f, undefined);
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.get good[1]",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.get(env.schemas.good[1].id).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[1].id);
            test.assert(f.region, env.schemas.good[1].region);
          });
        }
      },

      {
        desc: "# fitness.bodyMeasurement.getAll (one record)",
        run: function (env, test) {
          return env. fitness.bodyMeasurement.getAll().then(function (fitness) {
            test.assertTypeAnd(fitness, 'object');
            console.log('fitness', fitness);
            test.assertType(fitness[env.schemas.good[0].id], 'undefined');
            test.assertType(fitness[env.schemas.good[1].id], 'object');
          });
        }
      }
    ]

  });

  return suites;
});

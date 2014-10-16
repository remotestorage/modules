if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}
define(['require', 'bluebird', 'remotestoragejs'], function (require, Promise, RemoteStorage) {
  var suites = [];

  suites.push({
    desc: 'fitness',
    setup: function (env, test) {
      global.remoteStorage = new RemoteStorage();
      require('./../src/fitness');
      remoteStorage.access.claim('fitness', 'rw');
      env.fitness = remoteStorage.fitness;
      env.schemas = {
        bad: [
          {
            weight: 123
          },
          {
            clothing: {
              pant_size: 38
            },
            weight: {
              minor: 250
            },
            height: {
              minor: 144
            }
          }
        ],
        good: [
          {
            region: "metric",
            height: {
              minor: 210
            },
            clothing: {
              pant_size: 32
            },
            thigh_size: 44
          },
          {
            region: "usa",
            height: {
              major: 5,
              minor: 11
            }
          }
        ]
      };

      test.assertType(remoteStorage.fitness, 'object');
    },
    tests: [

      {
        desc: "#fitness.getAll returns empty object",
        run: function (env, test) {
          env.fitness.getAll().then(function (fitness) {
            test.assert(fitness, {});
          }, test.fail);
        }
      },

      {
        desc: "#fitness.add bad[0]",
        willFail: true,
        run: function (env, test) {
          return env.fitness.add(env.schemas.bad[0]);
        }
      },
      {
        desc: "#fitness.add bad[1]",
        willFail: true,
        run: function (env, test) {
          return env.fitness.add(env.schemas.bad[1]);
        }
      },

      {
        desc: "#fitness.getListing ",
        run: function (env, test) {
          return env.fitness.getListing().then(function (l) {
            test.assertTypeAnd(l, 'object');
            var expected = {};
            test.assert(l, expected);
          });
        }
      },

      {
        desc: "#fitness.add feed[0]",
        run: function (env, test) {
          return env.fitness.add(env.schemas.good[0]).then(function (f) {
            env.schemas.good[0] = f;
            test.assertType(f.id, 'string');
          });
        }
      },

      {
        desc: "#fitness.add feed[1]",
        run: function (env, test) {
          return env.fitness.add(env.schemas.good[1]).then(function (f) {
            env.schemas.good[1] = f;
            test.assertType(f.id, 'string');
          });
        }
      },

      {
        desc: "#fitness.get feed[0]",
        run: function (env, test) {
          return env.fitness.get(env.schemas.good[0].id).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[0].id);
            test.assert(f.region, env.schemas.good[0].region);
          });
        }
      },

      {
        desc: "#fitness.get (verify update) feed[0]",
        run: function (env, test) {
          return env.fitness.get(env.schemas.good[0].id).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[0].id);
            test.assert(f.region, env.schemas.good[0].region);
          });
        }
      },

      {
        desc: "#fitness.getListing ",
        run: function (env, test) {
          return env.fitness.getListing().then(function (l) {
            test.assertTypeAnd(l, 'object');
            var expected = {};
            expected[env.schemas.good[0].id] = true;
            expected[env.schemas.good[1].id] = true;
            test.assert(l, expected);
          });
        }
      },

      {
        desc: "#fitness.getAll (two records)",
        run: function (env, test) {
          return env.fitness.getAll().then(function (fitness) {
            test.assertTypeAnd(fitness, 'object');
            test.assertType(fitness[env.schemas.good[1].id], 'object');
          });
        }
      },

      {
        desc: "#fitness.delete feed[0]",
        run: function (env, test) {
          return env.fitness.remove(env.schemas.good[0].id);
        }
      },

      {
        desc: "#fitness.get feed[0]",
        run: function (env, test) {
          return env.fitness.get(env.schemas.good[0].id).then(function (f) {
            test.assert(f, undefined);
          });
        }
      },

      {
        desc: "#fitness.get feed[1]",
        run: function (env, test) {
          return env.fitness.get(env.schemas.good[1].id).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[1].id);
            test.assert(f.region, env.schemas.good[1].region);
          });
        }
      },

      {
        desc: "#fitness.getAll (one record)",
        run: function (env, test) {
          return env.fitness.getAll().then(function (fitness) {
            test.assertTypeAnd(fitness, 'object');
            test.assertType(fitness[env.schemas.good[0].id], 'undefined');
            test.assertType(fitness[env.schemas.good[1].id], 'object');
          });
        }
      }
    ]

  });

  return suites;
});

if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}
define(['require', 'bluebird', 'remotestoragejs'], function (require, Promise, RemoteStorage) {
  var suites = [];

  suites.push({
    desc: '# feeds.rssAtom',
    setup: function (env, test) {
      global.remoteStorage = new RemoteStorage();
      require('./../src/feeds');
      remoteStorage.access.claim('feeds', 'rw');
      env.feeds = remoteStorage.feeds;
      env.schemas = {
        bad: [
          {
            title: "Dood"
          },
          {
            url: "http://lalala.com",
            name: "no extra params"
          }
        ],
        good: [
          {
            title: "Awesome Feed",
            url: "http://www.example.com/feed"
          },
          {
            title: "Slightly Spectacular Feed",
            url: "http://www.whitehouse.com/feed"
          }
        ]
      };

      test.assertType(remoteStorage.feeds, 'object');
    },
    tests: [

      {
        desc: "# fitness.bodyMeasurement exists",
        run: function (env, test) {
          test.assertType(env.feeds.rssAtom, 'object');
        }
      },

      {
        desc: "# feeds.rssAtom.getAll returns empty object",
        run: function (env, test) {
          env.feeds.rssAtom.getAll().then(function (feeds) {
            test.assert(feeds, {});
          }, test.fail);
        }
      },

      {
        desc: "# feeds.rssAtom.create bad[0]",
        willFail: true,
        run: function (env, test) {
          return env.feeds.rssAtom.create(env.schemas.bad[0]);
        }
      },
      {
        desc: "# feeds.rssAtom.create bad[1]",
        willFail: true,
        run: function (env, test) {
          return env.feeds.rssAtom.create(env.schemas.bad[1]);
        }
      },

      {
        desc: "# feeds.rssAtom.getListing ",
        run: function (env, test) {
          return env.feeds.rssAtom.getListing().then(function (l) {
            test.assertTypeAnd(l, 'object');
            var expected = {};
            test.assert(l, expected);
          });
        }
      },

      {
        desc: "# feeds.rssAtom.create good[0]",
        run: function (env, test) {
          return env.feeds.rssAtom.create(env.schemas.good[0]).then(function (f) {
            env.schemas.good[0] = f;
            test.assertType(f.id, 'string');
          });
        }
      },

      {
        desc: "# feeds.rssAtom.create good[1]",
        run: function (env, test) {
          return env.feeds.rssAtom.create(env.schemas.good[1]).then(function (f) {
            env.schemas.good[1] = f;
            test.assertType(f.id, 'string');
          });
        }
      },

      {
        desc: "# feeds.rssAtom.get good[0]",
        run: function (env, test) {
          return env.feeds.rssAtom.get(env.schemas.good[0].url).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[0].id);
            test.assertAnd(f.url, env.schemas.good[0].url);
            test.assert(f.title, env.schemas.good[0].title);
          });
        }
      },

      {
        desc: "# feeds.rssAtom.update good[0]",
        run: function (env, test) {
          env.schemas.good[0].title = 'Bluebird';
          return env.feeds.rssAtom.update(env.schemas.good[0]).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[0].id);
            test.assertAnd(f.url, env.schemas.good[0].url);
            test.assert(f.title, env.schemas.good[0].title);
          });
        }
      },

      {
        desc: "# feeds.rssAtom.get (verify update) good[0]",
        run: function (env, test) {
          return env.feeds.rssAtom.get(env.schemas.good[0].url).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[0].id);
            test.assertAnd(f.url, env.schemas.good[0].url);
            test.assert(f.title, env.schemas.good[0].title);
          });
        }
      },

      {
        desc: "# feeds.rssAtom.getListing ",
        run: function (env, test) {
          return env.feeds.rssAtom.getListing().then(function (l) {
            test.assertTypeAnd(l, 'object');
            var expected = {};
            expected[env.schemas.good[0].id] = true;
            expected[env.schemas.good[1].id] = true;
            test.assert(l, expected);
          });
        }
      },

      {
        desc: "# feeds.rssAtom.getAll (two records)",
        run: function (env, test) {
          return env.feeds.rssAtom.getAll().then(function (feeds) {
            test.assertTypeAnd(feeds, 'object');
            test.assertType(feeds[env.schemas.good[1].id], 'object');
          });
        }
      },

      {
        desc: "# feeds.rssAtom.delete good[0]",
        run: function (env, test) {
          return env.feeds.rssAtom.remove(env.schemas.good[0].url);
        }
      },

      {
        desc: "# feeds.rssAtom.get good[0]",
        run: function (env, test) {
          return env.feeds.rssAtom.get(env.schemas.good[0].url).then(function (f) {
            test.assert(f, undefined);
          });
        }
      },

      {
        desc: "# feeds.rssAtom.get good[1]",
        run: function (env, test) {
          return env.feeds.rssAtom.get(env.schemas.good[1].url).then(function (f) {
            test.assertTypeAnd(f, 'object');
            test.assertAnd(f.id, env.schemas.good[1].id);
            test.assertAnd(f.url, env.schemas.good[1].url);
            test.assert(f.title, env.schemas.good[1].title);
          });
        }
      },

      {
        desc: "# feeds.rssAtom.getAll (one record)",
        run: function (env, test) {
          return env.feeds.rssAtom.getAll().then(function (feeds) {
            test.assertTypeAnd(feeds, 'object');
            test.assertType(feeds[env.schemas.good[0].id], 'undefined');
            test.assertType(feeds[env.schemas.good[1].id], 'object');
          });
        }
      }
    ]

  });

  return suites;
});

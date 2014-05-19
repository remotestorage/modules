require('./test/dependencies');
require('./src/irc-credentials');
define(['require'], function(require) {
  var suites = [];

  suites.push({
    desc: 'irc',
    setup: function (env, test) {
      env.config = {
        actor: {
          name: 'Joe Bloggs',
          address: 'jbloggs123'
        },
        object: {
          objectType: 'credentials',
          server: 'irc.freenode.net',
          password: ''
        }
      };
      env.configBad = {
        host: false,
        tls: 'uhh'
      };
      remoteStorage.caching.enable('/');
      env.irc = remoteStorage.irc;
      test.done();
    },
    tests: [

      {
        desc: "set BAD config.json",
        willFail: true,
        run: function (env, test) {
          env.irc.writeConfig(env.configBad).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.irc.writeConfig(env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "get config.json",
        run: function (env, test) {
          env.irc.getConfig().then(function (d) {
            test.assert(d, env.config);
          }, function () {
            test.result(false);
          });
        }
      }
    ]

  });

  return suites;
});

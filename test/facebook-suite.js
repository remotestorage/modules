require('./test/dependencies');
require('./src/utils/credentialsstore');
require('./src/facebook-credentials');
define(['require'], function(require) {
  var suites = [];

  suites.push({
    desc: 'facebook',
    setup: function (env, test) {
      env.config = {
        actor: {
          address: 'user@host.com',
          name: 'User Host'
        },
        object: {
          objectType: 'credentials',
          access_token: 'DEADBEEF'
        }
      };
      env.configBad = {
        host: false,
        tls: 'uhh'
      };
      remoteStorage.caching.enable('/');
      env.facebook = remoteStorage.facebook;
      test.done();
    },
    tests: [

      {
        desc: "set BAD config.json",
        willFail: true,
        run: function (env, test) {
          env.facebook.setConfig(undefined, env.configBad).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.facebook.setConfig(undefined, env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "get config.json",
        run: function (env, test) {
          env.facebook.getConfig().then(function (d) {
            delete env.config['@context'];
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

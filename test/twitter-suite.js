require('./test/dependencies');
require('./src/twitter-credentials');
define(['require'], function(require) {
  var suites = [];

  suites.push({
    desc: 'twitter',
    setup: function (env, test) {
      env.config = {
        actor: {
          address: 'user@host.com',
          name: 'User Host'
        },
        object: {
          objectType: 'credentials',

          access_token :        'ABC',
          access_token_secret : 'DEF',
          consumer_secret :     'GHI',
          consumer_key :        'JKL'
        }
      };
      env.configBad = {
        host: false,
        tls: 'uhh'
      };
      remoteStorage.caching.enable('/');
      env.twitter = remoteStorage.twitterCredentials;
      test.done();
    },
    tests: [

      {
        desc: "set BAD config.json",
        willFail: true,
        run: function (env, test) {
          env.twitter.writeConfig(env.configBad).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.twitter.writeConfig(env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "get config.json",
        run: function (env, test) {
          env.twitter.getConfig().then(function (d) {
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

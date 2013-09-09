require('./test/dependencies');
define(['require'], function(require) {
  var suites = [];

  suites.push({
    desc: 'sockethub',
    setup: function (env, test) {
      env.config = {
        host: 'example.com',
        port: 829,
        path: '/sockethub',
        tls: true,
        secret: '123'
      };
      env.configBad = {
        host: false,
        tls: 'uhh'
      };

      remoteStorage.caching.enable('/');
      env.sockethub = remoteStorage.sockethub;
      test.done();
    },
    tests: [

      {
        desc: "set BAD config.json",
        willFail: true,
        run: function (env, test) {
          env.sockethub.writeConfig(env.configBad).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.sockethub.writeConfig(env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.sockethub.getConfig().then(function (d) {
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

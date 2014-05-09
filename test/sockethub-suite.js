require('./test/dependencies');
define(['require', '../scripts/lib/sjcl'], function(require, sjcl) {
  require('../src/utils/credentialsstore');
  require('../src/sockethub');

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
          env.sockethub.setConfig(undefined, env.configBad).then(function(res) {
            console.log('33', res);
            test.done();
          }, function (err) {
            console.log('36', err);
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.sockethub.setConfig(undefined, env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "get config.json",
        run: function (env, test) {
          env.sockethub.getConfig(undefined).then(function (d) {
            console.log('got', d);
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

require('./test/dependencies');
require('./src/utils/credentialsstore');
require('./src/sockethub_credentials');
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
      env.sockethub = remoteStorage.sockethub_credentials;
      test.done();
    },
    tests: [

      {
        desc: 'set BAD config.json',
        willFail: true,
        run: function (env, test) {
          env.sockethub.set(undefined, env.configBad).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: 'set config.json',
        run: function (env, test) {
          env.sockethub.set(undefined, env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: 'set config.json',
        run: function (env, test) {
          env.sockethub.get().then(function (d) {
            delete env.config['@context'];
            test.assert(d, env.config);
          }, function (e) {
            console.log(e);
            test.result(false);
          });
        }
      }
    ]

  });

  return suites;
});

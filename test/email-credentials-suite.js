require('./test/dependencies');
require('./src/utils/credentialsstore');
require('./src/email-credentials');
define(['require'], function(require) {
  var suites = [];

  suites.push({
    desc: 'email',
    setup: function (env, test) {
      env.config = {
        actor: {
          address: 'user@host.com',
          name: 'User Host'
        },
        object: {
          objectType: 'credentials',
          smtp: {
            username: 'user@host.com',
            host: 'mail.host.com',
            password: 'bla',
            tls: false,
            port: 25
          },
          imap: {
            username: 'user@host.com',
            host: 'mail.host.com',
            password: 'bloo',
            tls: false,
            port: 143
          }
        }
      };
      env.configBad = {
        host: false,
        tls: 'uhh'
      };
      remoteStorage.caching.enable('/');
      env.email = remoteStorage.email;
      test.done();
    },
    tests: [

      {
        desc: "set BAD config.json",
        willFail: true,
        run: function (env, test) {
          env.email.setConfig(undefined, env.configBad).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.email.setConfig(undefined, env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "get config.json",
        run: function (env, test) {
          env.email.getConfig().then(function (d) {
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

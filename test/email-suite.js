require('./test/dependencies');

require('./src/utils/credentialsstore');
require('./src/utils/prefixtree');
require('./src/email');
define([], function() {

  var suites = [];

  // setup shared by all email suites
  function commonSetup(env) {
    remoteStorage.caching.enable('/');
    // email module
    env.email = remoteStorage.email;
    // email scope (to test if stuff was stored correctly)
    env.emailScope = remoteStorage.scope('/email/');
  }

  suites.push({
    name: "email.credentials",
    desc: "email accounts / credentials management",
    setup: function(env, test) {
      commonSetup(env);

      // fixtures
      env.config = {
        actor: {
          name: "Max Muster",
          address: "max@muster.de"
        },
        object: {
          objectType: 'credentials',
          smtp: {
            host: "smtp.muster.de",
            port: 25,
            tls: true,
            username: "max",
            password: "unguessable"
          },
          imap: {
            host: "imap.muster.de",
            port: 993,
            tls: true,
            username: "max",
            password: "unguessable"
          }
        }
      };

      test.done();
    },
    tests: [

      {
        desc: "set BAD config.json",
        willFail: true,
        run: function (env, test) {
          env.email.setConfig(undefined, env.configBad).then(function(res) {
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
          env.email.setConfig(undefined, env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "get config.json",
        run: function (env, test) {
          env.email.getConfig(undefined).then(function (d) {
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

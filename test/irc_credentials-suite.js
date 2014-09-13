require('./test/dependencies');
require('./src/utils/credentialsstore');
require('./src/irc_credentials');
define(['require'], function(require) {
  var suites = [];
  suites.push({
    desc: 'irc_credentials',
    setup: function (env, test) {
      env.config = {
        id: 'myconfig',
        name: 'Joe Bloggs',
        nick: 'jbloggs123',
        objectType: 'credentials',
        server: 'irc.freenode.net',
        password: 'sdfs'
      };
      env.configBad = {
        host: false,
        tls: 'uhh'
      };
      remoteStorage.caching.enable('/');
      env.irc = remoteStorage['irc_credentials'];
      test.done();
    },
    tests: [

      {
        desc: "set BAD config.json",
        willFail: true,
        run: function (env, test) {
          env.irc.set(env.configBad).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.irc.set(env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "get config.json",
        run: function (env, test) {
          env.irc.get('myconfig').then(function (d) {
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

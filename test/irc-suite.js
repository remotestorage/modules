require('./test/dependencies');
define(['require', '../scripts/lib/sjcl'], function(require, sjcl) {
  require('../src/utils/credentialsstore');
  require('../src/irc');

  var suites = [];

  suites.push({
    desc: 'irc',
    setup: function (env, test) {
      env.config = {
        actor: {
          address: 'myircnick',
          name: 'My IRC Nick'
        },
        object: {
          nick: 'myircnick',
          objectType: 'credentials',
          server: 'example.com',
          password: '',
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
          env.irc.setConfig(undefined, env.configBad).then(function(res) {
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
          env.irc.setConfig(undefined, env.config).then(test.done, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "get config.json",
        run: function (env, test) {
          env.irc.getConfig(undefined).then(function (d) {
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

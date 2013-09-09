if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

try {
  global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  global.localStorage = require('localStorage');
} catch(e) {
  console.log("You need to install 'xmlhttprequest' and 'localStorage' for this to work.");
  console.log("Run this:\n  npm install xmlhttprequest localStorage");
  process.exit(127);
}

require('./scripts/lib/remotestorage-node');
require('./src/sockethub');
global.remoteStorage = new RemoteStorage();

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

      remoteStorage.caching.enable("/");
      env.sockethub = remoteStorage.sockethub;
      test.done();
    },
    tests: [

      {
        desc: "set BAD config.json",
        willFail: true,
        run: function (env, test) {
          env.sockethub.writeConfig(env.configBad).then(function () {
            test.result(true);
          }, function () {
            test.result(false);
          });
        }
      },

      {
        desc: "set config.json",
        run: function (env, test) {
          env.sockethub.writeConfig(env.config).then(function () {
            test.result(true);
          }, function () {
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

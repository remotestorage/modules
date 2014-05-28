require('./test/dependencies');

requireAndLoad('./src/utils/syncedvar', 'SyncedVar');
console.log(jaribuReuse);

define(['require'], function(require) {

  var suites = [];

  suites.push({
    desc: 'SyncedVar suite',
    setup: function (env, test) {
      env.baseClient = {
        on: function(eventName, handler) { env.handlers[eventName].push(handler);}
      };
      env.responses = {};
      env.handlers = {
        change: []
      };

      function mock(obj, functionName) {
        obj[functionName] = function() {
          var i, input = [functionName].concat(Array.prototype.slice.call(arguments));
          if (!env.responses[input]) {
            console.log('MISSING (or falsy) RESPONSE', input, Object.keys(env.responses));
          }
          env.called.push(input);
          return env.responses[input];
        };
      }
      mock(env.baseClient, 'getFile');
      mock(env.baseClient, 'storeFile');
      
      env.syncedVar = new SyncedVar('foo', env.baseClient);
      test.done();
    },
    tests: [

      {
        desc: "load, set, get",
        run: function (env, test) {
          var res, storeFilePromise = promising(), getFilePromise = promising();
          env.called = [];
          env.responses[ ['storeFile', 'application/octet-stream', 'foo', 'bar'] ] = storeFilePromise;
          env.responses[ ['getFile', 'foo', false] ] = getFilePromise;
          env.syncedVar.load();
          getFilePromise.fulfill({
            data: 'initial value',
            mimeType: 'initial content type'
          });
          env.handlers['change'][0]({
            newValue: 'incoming value',
            newContentType: 'incoming content type',
            origin: 'remote'
          });
          env.syncedVar.set('bar');
          storeFilePromise.fulfill();
          res = env.syncedVar.get();
          test.assertAnd(res, 'bar');
          test.assertAnd(env.called, [
            [ 'getFile', 'foo', false ],//called during load, and then not again
            [ 'storeFile', 'application/octet-stream', 'foo', 'bar' ]
          ]);
          test.done();
        }
      },

      {
        desc: "incoming updates",
        run: function (env, test) {
          var res, storeFilePromise = promising(), getFilePromise = promising();
          env.called = [];
          env.responses[ ['storeFile', 'foo', 'bar'] ] = storeFilePromise;
          env.responses[ ['getFile', 'foo', false] ] = getFilePromise;
          env.syncedVar.load();
          getFilePromise.fulfill({
            data: 'initial value',
            mimeType: 'initial content type'
          });
          env.handlers['change'][0]({
            origin: 'remote',
            relativePath: 'foo',
            newValue: 'incoming value',
            newContentType: 'incoming content type'
          });
          res = env.syncedVar.get();
          test.assertAnd(res, 'incoming value');
          test.assertAnd(env.called, [
            [ 'getFile', 'foo', false ]//called during load, and then not again
          ]);
          test.done();
        }
      }
    ]

  });

  return suites;
});

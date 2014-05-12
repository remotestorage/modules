require('./test/dependencies');

requireAndLoad('./src/utils/syncedvar', 'SyncedVar');
console.log(jaribuReuse);

define(['require'], function(require) {

  var suites = [];

  suites.push({
    desc: 'SyncedVar suite',
    setup: function (env, test) {
      env.baseClient = {
        getFile: function(path, maxAge) { return env.responses[['getFile', path, maxAge]]; },
        storeFile: function(path, maxAge) { return env.responses[['storeFile', path, maxAge]]; },
        on: function(eventName, handler) { env.handlers[eventName].push(handler);}
      };
      env.responses = {};
      env.handlers = {
        change: []
      };
      env.syncedVar = new SyncedVar('foo', env.baseClient);
      test.done();
    },
    tests: [

      {
        desc: "load, set, get",
        run: function (env, test) {
          var res, storeFilePromise = promising(), getFilePromise = promising();
          env.responses[ ['storeFile', 'foo', 'bar'] ] = storeFilePromise;
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
          test.done();
        }
      },

      {
        desc: "incoming updates",
        run: function (env, test) {
          var res, storeFilePromise = promising(), getFilePromise = promising();
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
          test.done();
        }
      }
    ]

  });

  return suites;
});

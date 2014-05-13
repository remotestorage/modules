require('./test/dependencies');

requireAndLoad('./src/utils/prefixtree', 'PrefixTree');

define(['require'], function(require) {

  var suites = [];

  suites.push({
    desc: 'PrefixTree suite',
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
      mock(env.baseClient, 'getObject');
      mock(env.baseClient, 'storeObject');
      mock(env.baseClient, 'remove');
      mock(env.baseClient, 'getListing');
      
      env.prefixTree = new PrefixTree(env.baseClient);
      test.done();
    },
    tests: [

      {
        desc: "getFile",
        run: function (env, test) {
          var getFilePromise = promising(), getListingPromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['getFile', 'f/_oo', false] ] = getFilePromise;
          
          env.prefixTree.getFile('foo').then(function(res) {
            test.assertAnd(res.data, 'baseClient value');
            test.assertAnd(env.called, [ [ 'getListing', 'f/', false ], [ 'getFile', 'f/_oo', false ] ]);
            test.done();
          });
          getListingPromise.fulfill({
           '_oo': true
          });
          getFilePromise.fulfill({
            data: 'baseClient value',
            mimeType: 'baseClient content type'
          });
        }
      },

      {
        desc: "storeFile",
        run: function (env, test) {
          var getListingPromise = promising(), storeFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ] = storeFilePromise;
          env.prefixTree.storeFile('text/plain;charset=utf-8', 'foo', 'bar').then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ]);
            test.done();
          });
          
          getListingPromise.fulfill({
           '_oo': true
          });
          storeFilePromise.fulfill();
        }
      },

      {
        desc: "getObject",
        run: function (env, test) {
          var getObjectPromise = promising(), getListingPromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['getObject', 'f/_oo', false] ] = getObjectPromise;
          
          env.prefixTree.getObject('foo').then(function(res) {
            test.assertAnd(res, {
              some: 'data',
              nzme: [17, false]
            });
            test.assertAnd(env.called, [ [ 'getListing', 'f/', false ], [ 'getObject', 'f/_oo', false ] ]);
            test.done();
          });
          getListingPromise.fulfill({
           '_oo': true
          });
          getObjectPromise.fulfill({
            some: 'data',
            nzme: [17, false]
          });
        }
      },

      {
        desc: "storeObject",
        run: function (env, test) {
          var getListingPromise = promising(), storeObjectPromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['storeObject', 'config', 'f/_oo', {bla: true}] ] = storeObjectPromise;
          env.prefixTree.storeObject('config', 'foo', { bla: true }).then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['storeObject', 'config', 'f/_oo', {bla: true}] ]);
            test.done();
          });
          
          getListingPromise.fulfill({
           '_oo': true
          });
          storeObjectPromise.fulfill();
        }
      },

      {
        desc: "remove",
        run: function (env, test) {
          var getListingPromise = promising(), removePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['remove', 'f/_oo'] ] = removePromise;
          env.prefixTree.remove('foo').then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['remove', 'f/_oo'] ]);
            test.done();
          });
          
          getListingPromise.fulfill({
           '_oo': true
          });
          removePromise.fulfill();
        }
      },

      {
        desc: "getFile non-existing goes to baseClient with minimum depth",
        run: function (env, test) {
          var getFilePromise = promising(), getListingPromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['getFile', 'f/_oo', false] ] = getFilePromise;
          
          env.prefixTree.getFile('foo').then(function(res) {
            test.assertAnd(res.data, 'baseClient value');
            test.assertAnd(env.called, [ [ 'getListing', 'f/', false ], [ 'getFile', 'f/_oo', false ] ]);
            test.done();
          });
          getListingPromise.fulfill({
           '_oops': true
          });
          getFilePromise.fulfill({
            data: 'baseClient value',
            mimeType: 'baseClient content type'
          });
        }
      },

      {
        desc: "storeFile non-existing does go to baseClient minimum depth",
        run: function (env, test) {
          var getListingPromise = promising(), storeFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ] = storeFilePromise;
          env.prefixTree.storeFile('text/plain;charset=utf-8', 'foo', 'bar').then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ]);
            test.done();
          });
          
          getListingPromise.fulfill({});
          storeFilePromise.fulfill();
        }
      },

      {
        desc: "remove non-existing does go to baseClient minimum depth",
        run: function (env, test) {
          var getListingPromise = promising(), removePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ] = removePromise;
          env.prefixTree.storeFile('text/plain;charset=utf-8', 'foo', 'bar').then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ]);
            test.done();
          });
          
          getListingPromise.fulfill({});
          removePromise.fulfill();
        }
      },

      {
        desc: "getFile from a deeper level",
        run: function (env, test) {
          var getFilePromise = promising(), getListingPromise1 = promising(), getListingPromise2 = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise1;
          env.responses[ ['getListing', 'f/o/', false] ] = getListingPromise2;
          env.responses[ ['getFile', 'f/o/_o', false] ] = getFilePromise;
          env.prefixTree.setMaxLeaves(3);
          env.prefixTree.getFile('foo').then(function(res) {
            test.assertAnd(res.data, 'baseClient value');
            test.assertAnd(env.called, [ [ 'getListing', 'f/', false ], [ 'getListing', 'f/o/', false ], [ 'getFile', 'f/o/_o', false ] ]);
            test.done();
          });
          getListingPromise1.fulfill({
           '_1-': true,
           '_2balbla': true,
           '_3x': true,
           '_4yy': true,
           '_and5': true,
           'o/': true
          });
          getListingPromise2.fulfill({
           '_1-': true,
           '_2balbla': true,
           '_3x': true,
           '_o': true
          });
          getFilePromise.fulfill({
            data: 'baseClient value',
            mimeType: 'baseClient content type'
          });
        }
      },

      {
        desc: "getFile from a deeper level, where a folder of the same name exists",
        run: function (env, test) {
          var getFilePromise = promising(), getListingPromise1 = promising(), getListingPromise2 = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise1;
          env.responses[ ['getListing', 'f/o/', false] ] = getListingPromise2;
          env.responses[ ['getFile', 'f/o/_ooo', false] ] = getFilePromise;
          env.prefixTree.setMaxLeaves(3);
          env.prefixTree.getFile('foooo').then(function(res) {
            test.assertAnd(res.data, 'baseClient value');
            test.assertAnd(env.called, [ [ 'getListing', 'f/', false ], [ 'getListing', 'f/o/', false ], [ 'getFile', 'f/o/_ooo', false ] ]);
            test.done();
          });
          getListingPromise1.fulfill({
           '_1-': true,
           '_2balbla': true,
           '_3x': true,
           '_4yy': true,
           '_and5': true,
           'o/': true
          });
          getListingPromise2.fulfill({
           '_1-': true,
           '_2balbla': true,
           '_3x': true,
           '_ooo': true,
           'o/': true
          });
          getFilePromise.fulfill({
            data: 'baseClient value',
            mimeType: 'baseClient content type'
          });
        }
      },

      {
        desc: "storeFile non-existing goes one deeper if maxLeaves is reached",
        run: function (env, test) {
          var getListingPromise1 = promising(), getListingPromise2 = promising(), storeFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise1;
          env.responses[ ['getListing', 'f/o/', false] ] = getListingPromise2;
          env.responses[ ['storeFile', 'text/plain;charset=utf-8', 'f/o/_o', 'bar'] ] = storeFilePromise;
          
          env.prefixTree.setMaxLeaves(5);
          env.prefixTree.storeFile('text/plain;charset=utf-8', 'foo', 'bar').then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['getListing', 'f/o/', false], ['storeFile', 'text/plain;charset=utf-8', 'f/o/_o', 'bar'] ]);
            test.done();
          });
          
          getListingPromise1.fulfill({
           '_a': true,
           '_l': true,
           'o/': true,
           '_t': true,
           '_al': true,
           '_r': true,
           '_e': true,
           '_ad': true,
           'y/': true
          });
          
          getListingPromise2.fulfill({
           '_not': true,
           '_as': true,
           '_many': true,
           '_documents': true,
           'but/': true,
           'pos/': true,
           'si/': true,
           'bly/': true,
           'a/': true,
           'lot/': true,
           'of/': true,
           'folders/': true,
          });
          storeFilePromise.fulfill();
        }
      },

      {
        desc: "setMaxLeaves does not affect getFile",
        run: function (env, test) {
          var getFilePromise = promising(), getListingPromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['getFile', 'f/_oo', false] ] = getFilePromise;
         
          env.prefixTree.setMaxLeaves(2); 
          env.prefixTree.getFile('foo').then(function(res) {
            test.assertAnd(res.data, 'baseClient value');
            test.assertAnd(env.called, [ [ 'getListing', 'f/', false ], [ 'getFile', 'f/_oo', false ] ]);
            test.done();
          });
          getListingPromise.fulfill({
           'a': true,
           'l': true,
           'o': true,
           't': true,
           'al': true,
           'r': true,
           'e': true,
           'ad': true,
           'y': true
          });
          getFilePromise.fulfill({
            data: 'baseClient value',
            mimeType: 'baseClient content type'
          });
        }
      },

      {
        desc: "setMaxLeaves does not affect remove",
        run: function (env, test) {
          var getListingPromise = promising(), removePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['remove', 'f/_oo'] ] = removePromise;
          env.prefixTree.remove('foo').then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['remove', 'f/_oo'] ]);
            test.done();
          });
          
          getListingPromise.fulfill({
           'a': true,
           'l': true,
           'o': true,
           't': true,
           'al': true,
           'r': true,
           'e': true,
           'ad': true,
           'y': true
          });
          removePromise.fulfill();
        }
      },

      {
        desc: "storeFile ignores maxLeaves if the document already exists, even if the subfolder also exists",
        run: function (env, test) {
          var getListingPromise = promising(), storeFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise;
          env.responses[ ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ] = storeFilePromise;
          
          env.prefixTree.setMaxLeaves(5);
          env.prefixTree.storeFile('text/plain;charset=utf-8', 'foo', 'bar').then(function() {
            test.assertAnd(env.called, [ ['getListing', 'f/', false], ['storeFile', 'text/plain;charset=utf-8', 'f/_oo', 'bar'] ]);
            test.done();
          });
          
          getListingPromise.fulfill({
           '_a': true,
           '_l': true,
           'o/': true,
           '_t': true,
           '_al': true,
           '_r': true,
           '_e': true,
           '_ad': true,
           '_y': true,
           '_and': true,
           '_oo': true
          });
          storeFilePromise.fulfill();
        }
      },

      {
        desc: "storeFile non-existing goes as deep as it can",
        run: function (env, test) {
          var getListingPromise1 = promising(), getListingPromise2 = promising(), getListingPromise3 = promising(), storeFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise1;
          env.responses[ ['getListing', 'f/o/', false] ] = getListingPromise2;
          env.responses[ ['getListing', 'f/o/o/', false] ] = getListingPromise3;
          env.responses[ ['storeFile', 'text/plain;charset=utf-8', 'f/o/o/_', 'bar'] ] = storeFilePromise;
          
          env.prefixTree.storeFile('text/plain;charset=utf-8', 'foo', 'bar').then(function() {
            test.assertAnd(env.called, [
              ['getListing', 'f/', false],
              ['getListing', 'f/o/', false],
              ['getListing', 'f/o/o/', false],
              ['storeFile', 'text/plain;charset=utf-8', 'f/o/o/_', 'bar']
            ]);
            test.done();
          });
          
          getListingPromise1.fulfill({
           'o/': true
          });
          
          getListingPromise2.fulfill({
           'o/': true
          });
          
          getListingPromise3.fulfill({
           '_it should go here into this folder': true
          });
          storeFilePromise.fulfill();
        }
      },

      {
        desc: "storeFile never goes deeper than the length of the key",
        run: function (env, test) {
          var getListingPromise1 = promising(), getListingPromise2 = promising(), getListingPromise3 = promising(), storeFilePromise = promising();
          env.called = [];
          env.responses = {};
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise1;
          env.responses[ ['getListing', 'f/o/', false] ] = getListingPromise2;
          env.responses[ ['getListing', 'f/o/o/', false] ] = getListingPromise3;
          env.responses[ ['storeFile', 'text/plain;charset=utf-8', 'f/o/o/_', 'bar'] ] = storeFilePromise;
          
          env.prefixTree.setMaxLeaves(2);
          env.prefixTree.storeFile('text/plain;charset=utf-8', 'foo', 'bar').then(function() {
            test.assertAnd(env.called, [
              ['getListing', 'f/', false],
              ['getListing', 'f/o/', false],
              ['getListing', 'f/o/o/', false],
              ['storeFile', 'text/plain;charset=utf-8', 'f/o/o/_', 'bar']
            ]);
            test.done();
          });
          
          getListingPromise1.fulfill({
           'o/': true
          });
          
          getListingPromise2.fulfill({
           'o/': true
          });
          
          getListingPromise3.fulfill({
           '_it': true,
           '_should': true,
           '_ignore': true,
           '_maxLeaves': true,
           '_in': true,
           '_this': true,
           '_case': true,
           'undefined/': true
          });
          storeFilePromise.fulfill();
        }
      },

      {
        desc: "fireInitial fires all the right events",
        run: function (env, test) {
          var eventsSeen = { 'foo': false, 'foxy': false, 'bar': false, 'bazooka': false, 'bbb': false },
              getListingPromise1 = promising(), getListingPromise2 = promising(), getListingPromise3 = promising(),
              getListingPromise4 = promising(), getListingPromise5 = promising(), getListingPromise6 = promising(),
              getFilePromise1 = promising(), getFilePromise2 = promising(), getFilePromise3 = promising(),
              getFilePromise4 = promising(), getFilePromise5 = promising();
          env.called = [];
          env.responses = {};
          env.handlers['change'] = [];
          env.responses[ ['getListing', '', false] ] = getListingPromise1;
          env.responses[ ['getListing', 'f/', false] ] = getListingPromise2;
          env.responses[ ['getListing', 'f/o/', false] ] = getListingPromise3;
          env.responses[ ['getListing', 'b/', false] ] = getListingPromise4;
          env.responses[ ['getListing', 'b/a/', false] ] = getListingPromise5;
          env.responses[ ['getListing', 'b/b/', false] ] = getListingPromise6;
          env.responses[ ['getFile', 'f/o/_o', false] ] = getFilePromise1;
          env.responses[ ['getFile', 'f/o/_xy', false] ] = getFilePromise2;
          env.responses[ ['getFile', 'b/_ar', false] ] = getFilePromise3;
          env.responses[ ['getFile', 'b/a/_zooka', false] ] = getFilePromise4;
          env.responses[ ['getFile', 'b/b/_b', false] ] = getFilePromise5;
          
          env.prefixTree.on('change', function(evt) {
            test.assertAnd(eventsSeen[evt.key], false);
            eventsSeen[evt.key] = true;
            test.assertAnd(evt, {
              key: evt.key,
              origin: 'local',
              newValue: 'baseClient ' + evt.key,
              newContentType: 'baseClient content type ' + evt.key
            });
            for (var i in eventsSeen) {
              if (eventsSeen[i] === false) {
                return;
              }
            }
            test.assertAnd(env.called, [
              [ 'getListing', '', false ],
              [ 'getListing', 'b/', false ],
              [ 'getFile', 'b/_ar', false ],
              [ 'getListing', 'b/b/', false ],
              [ 'getFile', 'b/b/_b', false ],
              [ 'getListing', 'b/a/', false ],
              [ 'getFile', 'b/a/_zooka', false ],
              [ 'getListing', 'f/', false ],
              [ 'getListing', 'f/o/', false ],
              [ 'getFile', 'f/o/_o', false ],
              [ 'getFile', 'f/o/_xy', false ]
            ]);
            test.done();
          });
          env.prefixTree.fireInitial();
          
          getListingPromise1.fulfill({
           'f/': true,
           'b/': true
          });
          getListingPromise2.fulfill({
           'o/': true
          });
          getListingPromise3.fulfill({
           '_o': true,
           '_xy': true
          });
          getListingPromise4.fulfill({
           'a/': true,
           'b/': true,
           '_ar': true
          });
          getListingPromise5.fulfill({
           '_zooka': true
          });
          getListingPromise6.fulfill({
           '_b': true
          });
          getFilePromise1.fulfill({
            data: 'baseClient foo',
            mimeType: 'baseClient content type foo'
          });
          getFilePromise2.fulfill({
            data: 'baseClient foxy',
            mimeType: 'baseClient content type foxy'
          });
          getFilePromise3.fulfill({
            data: 'baseClient bar',
            mimeType: 'baseClient content type bar'
          });
          getFilePromise4.fulfill({
            data: 'baseClient bazooka',
            mimeType: 'baseClient content type bazooka'
          });
          getFilePromise5.fulfill({
            data: 'baseClient bbb',
            mimeType: 'baseClient content type bbb'
          });
        }
      },

      {
        desc: "incoming updates",
        run: function (env, test) {
          env.called = [];
          env.responses = {};
          env.handlers['change'] = [];
          env.prefixTree.on('change', function(evt) {
            test.assertAnd(evt, {
              key: 'foo',
              origin: 'remote',
              relativePath: 'f/_oo',
              newValue: 'incoming value',
              newContentType: 'incoming content type'
            });
            test.assertAnd(env.called, []);
            test.done();
          });
          env.handlers['change'][0]({
            origin: 'remote',
            relativePath: 'f/_oo',
            newValue: 'incoming value',
            newContentType: 'incoming content type'
          });
        }
      }
    ]

  });

  return suites;
});

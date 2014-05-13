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

      //TODO: "setMaxLeaves determines when a new subfolder is started",
      //TODO: add test for fireInitial
      {
        desc: "incoming updates",
        run: function (env, test) {
          env.called = [];
          env.responses = {};
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

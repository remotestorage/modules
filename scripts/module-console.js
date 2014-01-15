#!/usr/bin/env node

var moduleName = process.argv[2];

if(! moduleName) {
  console.log("Usage: " + process.argv[1] + " <module-name>");
  process.exit(127);
}

try {
  global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  global.localStorage = require('localStorage');
} catch(e) {
  console.log("You need to install 'xmlhttprequest' and 'localStorage' for this to work.");
  console.log("Run this:\n  npm install xmlhttprequest localStorage");
  process.exit(127);
}

var RemoteStorage = require('./lib/remotestorage-node');

global.remoteStorage = new RemoteStorage();

try {
  require('../src/' + moduleName);
} catch(exc) {
  console.log("Failed to load module '" + moduleName + "': ", exc.stack);
  process.exit(1);
}

remoteStorage.access.claim(moduleName, 'rw');
remoteStorage.caching.enable('/');

global[moduleName] = remoteStorage[moduleName];

var repl = require('repl');
var util = require('util');

console.log("Module loaded. You can use 'remoteStorage." + moduleName + "' or just '" + moduleName + "' to access it.");

// helper to distinguish sync / async results in 'writer' function
var AsyncResult = function(result, failed) {
  this.result = result;
  this.failed = failed;
}

repl.start({

  eval: function(cmd, context, filename, callback) {
    var result;
    try {
      result = eval(cmd)
    } catch(e) {
      return callback(e);
    }
    if(result && typeof(result) === 'object' && typeof(result.then) === 'function') {
      result.then(function(res) {
        callback(null, new AsyncResult(res, false));
      }, function(res) {
        callback(null, new AsyncResult(res, true));
      });
    } else {
      callback(null, result);
    }
  },

  writer: function(object) {
    if(typeof(object) === 'object' && object instanceof AsyncResult) {
      if(object.failed) {
        return 'Promise failed with: ' + util.inspect(object.result) + ('stack' in object.result ? object.result.stack : '');
      } else {
        return 'Promise fulfilled with: ' + util.inspect(object.result);
      }
    } else {
      return util.inspect(object);
    }
  }

});

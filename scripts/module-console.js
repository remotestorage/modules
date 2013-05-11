#!/usr/bin/env node

var moduleName = process.argv[2];

if(! moduleName) {
  console.log("Usage: " + process.argv[1] + " <module-name>");
  process.exit(127);
}

global.remoteStorage = require('./lib/remotestorage-node');

try { 
  require('../' + moduleName);
} catch(exc) {
  console.log("Failed to load module '" + moduleName + "': ", exc.stack);
  process.exit(1);
}

remoteStorage.claimAccess(moduleName, 'rw');

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
        callback(new AsyncResult(res, true));
      });
    } else {
      callback(null, result);
    }
  },

  writer: function(object) {
    if(typeof(object) === 'object' && object instanceof AsyncResult) {
      if(object.failed) {
        return 'Promise failed with: ' + util.inspect(object.result);
      } else {
        return 'Promise fulfilled with: ' + util.inspect(object.result);
      }
    } else {
      return util.inspect(object);
    }
  }

});

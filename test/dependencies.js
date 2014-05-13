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
global.remoteStorage = new RemoteStorage();

global.jaribuReuse = {};
global.requireAndLoad = function(fileName, className) {
  require(fileName);
  if (!global.jaribuReuse[className]) {
    global.jaribuReuse[className] = eval(className);
  }
  return global.jaribuReuse[className];
}

function SyncedMap(name, baseClient) {
  var data = {}, prefixTree = new PrefixTree(baseClient.scope(name+'/'));
  prefixTree.on('change', function(evt) {
    if (evt.origin != 'window') {
      try {
        data[evt.key] = JSON.parse(evt.newValue);
      } catch(err) {
      }
    }
  });
  return {
    get: function(key) {
      return data[key];
    },
    set: function(key, val) {
      prefixTree.storeFile('application/json', key, JSON.stringify(val));
      data[key]=val;
    },
    remove: function(key) {
      prefixTree.remove(key);
      delete data[key];
    },
    getKeys: function() {
      return Object.getOwnPropertyNames(data);
    },
    load: function(key) {
      return prefixTree.fireInitial();
    }
  };
}

if (global) {
  global.SyncedMap = SyncedMap;
}

function SyncedMap(name, baseClient) {
  var data = {}, prefixTree = PrefixTree(baseClient.scope(name+'/'));
  prefixTree.cache('', 'ALL');
  prefixTree.on('change', function(e) {
    if(e.origin != 'window') {
      data[e.key] = e.newValue;
      delete data[e.key]['@context'];
    }
  });
  return {
    get: function(key) {
      if(typeof(data[key]) === 'object') {
        delete data[key]['@context'];
      }
      return data[key];
    },
    set: function(key, val) {
      prefixTree.storeObject('SyncedMapItem', key, val);
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

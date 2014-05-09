function SyncedVar(name, baseClient) {
  var data, loaded = false;
  baseClient.on('change', function(e) {
    if(e.relativePath === name) {
      data = e.newValue;
      delete data['@context'];
    }
  });

  return {
    get: function() {
      if(typeof(data) === 'object') {
        delete data['@context'];
      }
      return data;
    },
    set: function(val) {
      baseClient.storeObject('SyncedVar', name, val);
      data=val;
    },
    load: function() {
      return baseClient.getObject(name, false).then(function(res) {
        data = res.data;
      });
    }
  };
}
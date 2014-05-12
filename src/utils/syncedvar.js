function SyncedVar(name, baseClient) {
  var data, loaded = false;
  baseClient.on('change', function(e) {
    if(e.relativePath === name) {
      data = e.newValue;
    }
  });

  return {
    get: function() {
      return data;
    },
    set: function(val) {
      baseClient.storeFile('application/octet-stream', name, val);
      data=val;
    },
    load: function() {
      return baseClient.getFile(name, false).then(function(res) {
        data = res.data;
      });
    }
  };
}

if (global) {
  global.SyncedVar = SyncedVar;
}

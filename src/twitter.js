RemoteStorage.defineModule('twitter', function(privClient, pubClient) {

  function setConfig(pwd, config) {
    privClient.storeFile('application/json', 'twitter-config', 
        sjcl.encrypt(pwd, JSON.stringify(config)));
  }
  function getConfig(pwd) {
    return privClient.getFile('twitter-config').then(function(a) {
      if (typeof(a) === 'object' && typeof(a.data) === 'string') {
        a.data = sjcl.decrypt(pwd, a.data);
      }
      return a;
    });
  }
  return {
    exports: {
      setConfig: setConfig,
      getConfig: getConfig
    }
  };
});
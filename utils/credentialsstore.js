CredentialsStore = function(moduleName, privClient) {
  if (typeof(moduleName) !== 'string') {
    throw new Error('moduleName should be a string');
  }
  if (typeof(privClient) !== 'object') {
    throw new Error('privClient should be a (private) base client');
  }
  function setConfig(pwd, config) {
    if (typeof(pwd) !== 'string') {
      throw new Error('password should be a string');
    }
    if (typeof(config) !== 'object') {
      throw new Error('config should be an object');
    }
    if (!sjcl) {
      throw new Error('please include sjcl.js (the Stanford JS Crypto Library) in your app');
    }
    privClient.storeFile('application/json', moduleName+'-config', 
        sjcl.encrypt(pwd, JSON.stringify(config)));
  }
  function getConfig(pwd) {
    if (typeof(pwd) !== 'string') {
      throw new Error('password should be a string');
    }
    if (!sjcl) {
      throw new Error('please include sjcl.js (the Stanford JS Crypto Library) in your app');
    }
    return privClient.getFile(moduleName+'-config').then(function(a) {
      if (typeof(a) === 'object' && typeof(a.data) === 'string') {
        try {
          a.data = sjcl.decrypt(pwd, a.data);
        } catch(e) {
          throw new Error('could not decrypt irc-config');
        }
      } else {
        throw new Error(moduleName+'-config not found');
      }
      return a;
    });
  }
  return {
    setConfig: setConfig,
    getConfig: getConfig
  };
};
CredentialsStore = function(moduleName, privClient) {
  var algorithmPrefix =  'AES-CCM-128:';
  
  if (typeof(moduleName) !== 'string') {
    throw new Error('moduleName should be a string');
  }
  if (typeof(privClient) !== 'object') {
    throw new Error('privClient should be a (private) base client');
  }
  function setConfig(pwd, config) {
    if (typeof(config) !== 'object') {
      throw new Error('config should be an object');
    }
    if (!sjcl) {
      throw new Error('please include sjcl.js (the Stanford JS Crypto Library) in your app');
    }
    config = JSON.stringify(config);
    if(typeof(pwd) === 'string') {
      config = algorithmPrefix+sjcl.encrypt(pwd, config);
    }
    privClient.storeFile('application/json', moduleName+'-config', config);
  }
  function getConfig(pwd) {
    if (!sjcl) {
      throw new Error('please include sjcl.js (the Stanford JS Crypto Library) in your app');
    }
    return privClient.getFile(moduleName+'-config').then(function(a) {
      if (typeof(a) === 'object' && typeof(a.data) === 'string') {
        if (typeof(pwd) === 'string') {
          try {
            a.data = JSON.parse(sjcl.decrypt(pwd, a.data.substring(algorithmPrefix.length)));
          } catch(e) {
            throw new Error('could not decrypt irc-config');
          }
        } else {
          try {
            a.data = JSON.parse(a.data);
          } catch(e) {
            throw new Error('could not decrypt irc-config');
          }
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
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
    if (pwd && !sjcl) {
      throw new Error('please include sjcl.js (the Stanford JS Crypto Library) in your app');
    }
    config['@context'] = 'http://remotestorage.io/spec/modules/'+moduleName+'/config';
    var validationResult = privClient.validate(config);
    if (!validationResult.valid) {
      var promise = promising();
      promise.reject('Please follow the config schema - ' + JSON.stringify(validationResult));
      return promise;
    }
    config = JSON.stringify(config);
    if(typeof(pwd) === 'string') {
      config = algorithmPrefix+sjcl.encrypt(pwd, config);
    }
    return privClient.storeFile('application/json', moduleName+'-config', config);
  }
  function getConfig(pwd) {
    if (pwd && !sjcl) {
      throw new Error('please include sjcl.js (the Stanford JS Crypto Library) in your app');
    }
    return privClient.getFile(moduleName+'-config', false).then(function(a) {
      if (typeof(a) === 'object' && typeof(a.data) === 'string') {
        if (typeof(pwd) === 'string') {
          try {
            a.data = JSON.parse(sjcl.decrypt(pwd, a.data.substring(algorithmPrefix.length)));
          } catch(e) {
            throw new Error('could not decrypt '+moduleName+'-config with that password');
          }
        } else {
          try {
            a.data = JSON.parse(a.data);
          } catch(e) {
            throw new Error('could not parse '+moduleName+'-config, try specifying a password for decryption');
          }
        }
      } else {
        throw new Error(moduleName+'-config not found');
      }
      return a.data;
    });
  }
  return {
    setConfig: setConfig,
    getConfig: getConfig
  };
};

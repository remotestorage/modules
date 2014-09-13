RemoteStorage.util.CredentialsStore = (function () {
  /**
   * Class: CredentialsStore
   *
   * Given a moduleName and a privateClient, this class provides
   * a set and a set function which you can directly
   * use in your module. It also deals with optional client-side
   * encryption, and exposes a change event for the config you
   * store in it. It assumes your module declares a type
   * called 'credentials' using BaseClient.declareType. Other than
   * that, you will be able to pretty much expose the three methods
   * directly on your module.
   *
   * Parameters:
   *   moduleName - String, the name of the module in which you are
   *                    using it, but without the "-credentials" suffix.
   *   privClient - The private BaseClient for your module, you get this from
   *                    the callback call in remoteStorage.defineModule
   */
  function CredentialsStore(moduleName, privClient, genId) {
    this.algorithmPrefix =  'AES-CCM-128:';
    this.changeHandlers = [];
    this.moduleName = moduleName;
    this.privClient = privClient;
    this.genId = (typeof genId === 'function') ? genId : privClient.uuid;

    if (typeof(moduleName) !== 'string') {
      throw new Error('moduleName should be a string');
    }
    if (typeof(privClient) !== 'object') {
      throw new Error('privClient should be a (private) base client');
    }

    privClient.on('change', function(evt) {
      if (evt.path === moduleName) {
        for (var i = 0, len = this.changeHandlers.length; i < len; i++) {
          this.changeHandlers[i]();
        }
      }
    }.bind(this));
  }

  /**
   * Function: set
   *
   * Set the credentials
   *
   * Parameters:
   *   crednetials - object, the credentials to be saved.
   *   password - String value of the password for client-side encryption, or undefined.
   *
   * Throws:
   *   'credentials should be an object'
   *   'please include sjcl.js (the Stanford JS Crypto Library) in your app'
   *   'Schema Not Found' (if you didn't call declareType first)
   *   'Please follow the config schema - (followed by the schema from your declareType)'
   */
  CredentialsStore.prototype.set = function(credentials, password) {
    if (typeof(credentials) !== 'object') {
      throw 'credentials should be an object';
    }

    if (password && (typeof sjcl === 'undefined')) {
      throw 'please include sjcl.js (the Stanford JS Crypto Library) in your app';
    }

    credentials['@context'] = 'http://remotestorage.io/spec/modules/' + this.moduleName;
    var validationResult = this.privClient.validate(credentials);

    if (!validationResult.valid) {
      var promise = promising();
      promise.reject('Please follow the credentials schema - ' + JSON.stringify(validationResult));
      return promise;
    }

    credentials = JSON.stringify(credentials);

    if (typeof(password) === 'string') {
      credentials = this.algorithmPrefix + sjcl.encrypt(password, credentials);
    }

    if (!credentials.id) {
      console.log('typeof genId: '+typeof this.genId);
      console.log('typeof uuid: '+typeof this.privClient.uuid);
      credentials.id = this.genId(credentials);
    }

    return this.privClient.storeFile('application/json', credentials.id, credentials);
  };

  /**
   * Function: set
   *
   * Get the credentials
   *
   * Parameters:
   *   filename - name of file you'd like to fetch (id of your credentials object)
   *   password - String value of the password for client-side encryption, or undefined.
   *
   * Throws:
   *   'please include sjcl.js (the Stanford JS Crypto Library) in your app'
   *   'could not decrypt (moduleName) with that password'
   *   'could not parse (moduleName) as unencrypted JSON'
   *   '(moduleName) is encrypted, please specify a password for decryption'
   *   '(moduleName) is not encrypted, or encrypted with a different algorithm'
   */
  CredentialsStore.prototype.get = function(filename, password) {
    if (password && (typeof sjcl === 'undefined')) {
      throw 'please include sjcl.js (the Stanford JS Crypto Library) in your app';
    }

    function __getFile(file) {
      return this.privClient.getFile(filename).then(function(a) {
        if (typeof(a) === 'object' && typeof(a.data) === 'string') {
          if (typeof(password) === 'string') {
            if (a.data.substring(0, this.algorithmPrefix.length) !== this.algorithmPrefix) {
              throw filename + ' is not encrypted, or encrypted with a different algorithm';
            }
            try {
              a.data = JSON.parse(sjcl.decrypt(password, a.data.substring(this.algorithmPrefix.length)));
            } catch(e) {
              throw 'could not decrypt ' + filename + ' with that password';
            }
          } else {
            if (a.data.substring(0, this.algorithmPrefix.length) === this.algorithmPrefix) {
              throw filename + ' is encrypted, please specify a password for decryption';
            }
            try {
              a.data = JSON.parse(a.data);
            } catch(e) {
              throw 'could not parse ' + filename + ' as unencrypted JSON';
            }
          }
        } else {
          throw filename + ' not found';
        }
        return a.data;
      }.bind(this));
    }

    if (typeof filename !== 'string') {
      return this.privClient.getListing().then(function (files) {
        if (typeof files[0] === 'string') {
          return __getFile(files[0]);
        }
      });
    } else {
      return __getFile(filename);
    }


  };

  CredentialsStore.prototype.getListing = function () {
    return this.privClient.getListing();
  };

  /**
   * Function: on
   *
   * Register an event handler. Currently only used for change events.
   *
   * Parameters:
   *   eventName - Has to be the String 'change'
   *   handler   - The function that should be called when the config changes.
   *                   It will be called without any arguments.
   */
  CredentialsStore.prototype.on = function(eventName, handler) {
    if (eventName === 'change') {
      this.changeHandlers.push(handler);
    }
  };
  return CredentialsStore;
})();

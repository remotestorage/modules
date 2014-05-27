(function () {
  var moduleName = 'sockethub';

  RemoteStorage.defineModule(moduleName, function(privateClient, publicClient) {
    privateClient.declareType('config', {
      "description" : "sockethub config file",
      "type" : "object",
      "properties": {
        "host": {
          "type": "string",
          "description": "the hostname to connect to",
          "format": "uri",
          "required": true
        },
        "port": {
          "type": "number",
          "description": "the port number to connect to",
          "required": true
        },
        "path": {
          "type": "string",
          "description": "path portion of the URI, if any",
          "required": false
        },
        "tls": {
          "type": "boolean",
          "description": "whether or not to use TLS",
          "required": false
        },
        "register": {
          "description" : "sockethub config file",
          "type" : "object",
          "properties": {
            "secret": {
              "type": "string",
              "description": "the secret to identify yourself with the sockethub server",
              "required": true
            }
          },
          "required": true
        }
      }
    });
    return {
      exports: {
        c: privateClient,

        getConfig: function () {
          return privateClient.getObject('config.json');
        },

        writeConfig: function (data) {
          return privateClient.storeObject('config', 'config.json', data);
        }
      }
    };
  });

})();

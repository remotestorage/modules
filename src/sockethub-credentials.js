/**
 * File: Sockethub
 *
 * Maintainer: Michiel de Jong <michiel@unhosted.org>
 * Version: -    0.1.0
 *
 */
(function () {
  var moduleName = 'sockethub';

  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }

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
      exports: new CredentialsStore('sockethub', privateClient)
    };
  });

})();

/**
 * File: Sockethub Credentials
 *
 * Maintainer: Nick Jennings <nick@silverbucket.net>
 * Version: -    0.2.0
 *
 */
RemoteStorage.defineModule('sockethub_credentials', function(privateClient, publicClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }

  privateClient.declareType('credentials', {
    type: 'object',
    description: 'sockethub credentials file',
    required: ['host', 'port', 'secret'],
    additionalProperties: false,
    properties: {
      id: {
        type: 'string',
        description: 'a uniquely identifiable string (default. [ws|wss]://host:port/path)',
        format: 'string'
      },
      host: {
        type: 'string',
        description: 'the hostname to connect to',
        format: 'uri'
      },
      port: {
        type: 'number',
        description: 'the port number to connect to'
      },
      path: {
        type: 'string',
        description: 'path portion of the URI, if any'
      },
      tls: {
        type: 'boolean',
        description: 'whether or not to use TLS'
      },
      secret: {
        type: 'string',
        description: 'the secret to identify yourself with the sockethub server'
      },
      enabled: {
        type: 'boolean'
      }
    }
  });

  return {
    exports: new CredentialsStore('sockethub_credentials', privateClient, function genId(o) {
        var proto = (o.tls) ? 'wss://' : 'ws://';
        var port = (o.port) ? ':' + o.port : '';
        var path = (o.path) ? o.path : '';
        return proto + o.host + port + path;
      })
  };
});

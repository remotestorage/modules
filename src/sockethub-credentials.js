/**
 * File: Sockethub Credentials
 *
 * Maintainer: - Nick Jennings <nick@silverbucket.net>
 * Version:    - 0.2.0
 *
 */
RemoteStorage.defineModule('sockethub-credentials', function(privateClient, publicClient) {
  privateClient.cache('', 'ALL');

  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }

  privateClient.declareType('credentials', {
    type: 'object',
    description: 'sockethub credentials file',
    required: ['host', 'port', 'secret'],
    additionalProperties: false,
    properties: {
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
      '@context': {
         type: 'string'
      }
    }
  });

  return {
    exports: new CredentialsStore('sockethub-credentials', privateClient)
  };
});

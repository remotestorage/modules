/**
 * File: XMPP Credentials
 *
 * Maintainer: Nick Jennings <nick@silverbucket.net>
 * Version: -    0.2.0
 *
 */
RemoteStorage.defineModule('xmpp-credentials', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
  /**
   * Schema: xmpp/credentials
   *
   * Credentials for XMPP
   *
   *   username - username (string)
   *   password - password (string)
   *   server   - the xmpp server to connect to (string)
   *   resource - the resource name (string)
   *   port     - the port to connect to (number)
   */
  privClient.declareType('credentials', {
    type: 'object',
    description: 'XMPP credentials file',
    required: ['username', 'password', 'server', 'resource'],
    additionalProperties: false,
    properties: {
      uri: {
        type: 'string',
        description: 'unique identifier complete with URI prefix. ie. xmpp:username@host.org'
      },
      username: {
        type: 'string'
      },
      password: {
        type: 'string'
      },
      server: {
        type: 'uri'
      },
      resource : {
        type: 'string'
      },
      port: {
        type: 'number'
      },
      enabled: {
        type: 'boolean'
      }
    }
  });

  return {
    exports: new CredentialsStore('xmpp-credentials', privClient)
  };
});

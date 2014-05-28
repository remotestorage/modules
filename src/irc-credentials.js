/**
 * File: Irc
 */
RemoteStorage.defineModule('irc', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
  /**
   * Schema: irc/config
   *
   * Credentials configuration for irc
   *
   * actor - object:
   *   name - not used (but must be a string)
   *   address - irc nick to use (string)
   * object - object:
   *   objectType - always 'credentials'
   *   server - the irc server to connect to (string)
   *   port - the port to connect to (number)
   */
  privClient.declareType('config', {
    type: 'object',
    properties: {
      actor: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' },
        },
        required: ['name', 'address']
      },
      object: {
        type: 'object',
        properties: {
          objectType: {type: 'string', 'enum': ['credentials'] },
          server: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['objectType', 'server']
      }
    },
    required: ['actor', 'object']
  });

  return {
    exports: new CredentialsStore('irc', privClient)
  };
});

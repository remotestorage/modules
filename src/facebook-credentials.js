/**
 * File: Facebook
 *
 * Maintainer: - Michiel de Jong <michiel@unhosted.org>
 * Version:    - 0.1.0
 *
 */
RemoteStorage.defineModule('facebook', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
  /**
   * Schema: facebook/config
   *
   * Credentials configuration for Facebook
   *
   * actor - object:
   *   name - not used (must be a string)
   *   address - not used (must be a string)
   * object - object:
   *   objectType - always 'credentials'
   *   access_token - your (short- or long-lived) access token for the Facebook API (string)
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
          access_token: { type: 'string' }
        },
        required: ['objectType', 'access_token']
      }
    },
    required: ['actor', 'object']
  });
  return {
    exports: new CredentialsStore('facebook', privClient)
  };
});

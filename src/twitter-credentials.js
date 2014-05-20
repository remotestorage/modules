RemoteStorage.defineModule('twitter', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
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
          access_token :        { type: 'string' },
          access_token_secret : { type: 'string' },
          consumer_secret :     { type: 'string' },
          consumer_key :        { type: 'string' }
        },
        required: ['objectType', 'access_token', 'access_token_secret', 'consumer_secret', 'consumer_key']
      }
    },
    required: ['actor', 'object']
  });
  return {
    exports: new CredentialsStore('twitter', privClient)
  };
});

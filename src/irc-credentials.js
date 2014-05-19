RemoteStorage.defineModule('irc-credentials', function(privClient, pubClient) {
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
          server: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['objectType', 'server']
      }
    },
    required: ['actor', 'object']
  });

  return {
    exports: CredentialsStore('irc', privClient)
  };
});

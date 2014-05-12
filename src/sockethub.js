RemoteStorage.defineModule('sockethub', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
  privClient.declareType('config', {
    type: 'object',
    properties: {
      host: { type: 'string' },
      port: { type: 'number' },
      path: { type: 'string' },
      ssl: { type: 'boolean' },
      tls: { type: 'boolean' },
      register: {
        type: 'object',
        properties: {
          secret: { type: 'string' }
        },
        required: ['secret']
      }
    },
    required: ['host', 'port', 'path', 'ssl', 'tls', 'register']
  });
  return {
    exports: CredentialsStore('sockethub', privClient)
  };
});

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
      tls: { type: 'boolean' },
      secret: { type: 'string' }
    },
    required: ['host', 'port', 'path', 'tls', 'secret']
  });
  return {
    exports: CredentialsStore('sockethub', privClient)
  };
});

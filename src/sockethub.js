RemoteStorage.defineModule('sockethub', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
  privClient.declareType('config', {
    type: 'object',
    properties: {
        host: 'string',
        port: 'number',
        path: 'string',
        tls: 'boolean',
        secret: 'string'
    }
  });
  return {
    exports: CredentialsStore('sockethub', privClient)
  };
});

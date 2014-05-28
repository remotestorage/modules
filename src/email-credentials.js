RemoteStorage.defineModule('email-credentials', function(privClient, pubClient) {
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
          imap: {
            type: 'object',
            properties: {
              host: { type: 'string' },
              port: { type: 'number' },
              tls: { type: 'boolean' },
              username: { type: 'string' },
              password: { type: 'string' }
            },
            required: ['host', 'port', 'tls', 'username', 'password']
          },
          smtp: {
            type: 'object',
            properties: {
              host: { type: 'string' },
              port: { type: 'number' },
              tls: { type: 'boolean' },
              username: { type: 'string' },
              password: { type: 'string' }
            },
            required: ['host', 'port', 'tls', 'username', 'password']
          }
        },
        required: ['objectType']
      }
    },
    required: ['actor', 'object']
  });
  return {
    exports: CredentialsStore('email', privClient)
  };
});

RemoteStorage.defineModule('facebook', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
  return {
    exports: CredentialsStore('facebook', privClient)
  };
});
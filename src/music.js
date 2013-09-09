remoteStorage.defineModule('music', function(privateClient, publicClient) {
  return {
    exports: {
      dontSync: function () {
        privateClient.release('');
        publicClient.release('');
      },
      getListing: function(path) {
        return publicClient.getListing(path);
      },
      getSongURL: function(path) {
        return publicClient.getItemURL(path);
      }
    }
  };
});

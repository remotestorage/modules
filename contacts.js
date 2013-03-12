remoteStorage.defineModule('contacts', function(privateClient, publicClient) {
  return {
    exports: {
      init: function () {
        privateClient.release('');
        publicClient.release('');
        privateClient.declareType('contact', {
          description: 'an entry in the user\'s addressbook',
          type: 'object',
          properties: {
            platform: { type: 'string', description: 'Refers to a platform as defined by sockethub, for instance \'facebook\' or \'email\'', required: true },
            name: { type: 'string', description: 'human-readable full name', required: true },
            identifier: { type: 'string', description: 'a string that uniquely identifies this user within the platform', required: true }
          }
        });
      },
      get: function(prefixChars) {
        var dir;
        if(prefixChars.length) {
          dir = prefixChars.join('/').'/';
        } else {
          dir = '';
        }
        return privateClient.getAll(dir);
      },
      add: function(platform, identifier, name) {
        var searchTerms = name.split(' ');
        for(var i=0; i<searchTerms.length; i++) {
          var obj = {
            platform: platform,
            identifier: identifier,
            name: name
          },
            path = '';
          for(var j=0; j<searchTerms[i].length; j++) {
            path += searchTerms[i][j]+'/';
          }
          path += platform+'%20'+identifier;
          privateClient.storeObject('contact', path, obj);
        }
      }
    }
  };
});

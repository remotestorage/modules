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
    
      getContacts: function() {
        return privateClient.getAll('');
      },

      addContact: function(platform, address, data) {
        return privateClient.storeObject('contact', platform+'/'+address, data);
      }
    }
  };
});

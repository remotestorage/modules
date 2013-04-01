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

      getContactsByPlatform: function(platform) {
        return privateClient.getAll('platform/'+platform+'/');
      },

      insertSeen: function(userAddress) {
        var oldSeen = getObject('seen/address/'+userAddress).seen;
        storeObject('seen/address/'+userAddress).seen, now);
        storeObject('seen/time/'+Ms+ks+ms, userAddress);
        removeObject('seen/time/'+MsOld+ksOld+msOld);
      },
      
      getContactsByRecency: function(endTime, maxNo) {//timestamp, previous (rehang). paged?
        //we could do megasecond/kilosecond/item, and then find and delete the old one.
        return privateClient.getAll(platform+'/');
      },

      getContactsByPrefix: function(prefix) {
        if(prefix.length==3) {
          return privateClient.getAll('prefix/'+prefix+'/');
        } else {
          //...
        }
      },

      addContact: function(platform, identifier, name) {
        return privateClient.storeObject('contact', platform+'/'+identifier, {
          platform: platform,
          identifier: identifier,
          name: name
        });
      }
    }
  };
});

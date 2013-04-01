remoteStorage.defineModule('messages', function(privateClient, publicClient) {
  function storeLast(userAddress, now) {
    privateClient.storeObject('last/'+userAddress, {
      timestamp: now
    });
  }
  return {
    exports: {
      init: function () {
        privateClient.release('');
        publicClient.release('');
        privateClient.declareType('message', {
          description: 'can be small (entry in the chat log) or big (email with CC\'s attachments)',
          key: 'timestamp',
          properties: {
            from: { type: 'useraddress', description: 'the sender', required: true },
            to: { type: 'useraddress or [useraddress]', description: 'the recipients. apart from mailto:, we invent mailcc:, mailbcc: to express CC\'s and BCC\'s', required: true },
            text: { type: 'utf-8 string', description: 'human-readable message', required: true },
            previous: { type: 'map', properties: {
              key: 'useraddress',
              type: 'timestamp',
              description: 'Previous message involving that contact'
            }
          }
        });
        privateClient.declareType('last-message', {
          description: 'pointer from a contact to the last message involving that contact',
          key: 'useraddress',
          properties: {
            timestamp: { type: 'timestamp', description: 'timestamp of last message involving that contact' }
          }
        });
      },

      getContactsByRecency: function() {
        return privateClient.getAll('last/').then(function(lastTimes) {
          var arr = [];
          for(var i in lastTimes) {
            arr.push({
              userAddress: i,
              lastMessage: lastTimes[i]
            });
          }
          arr.sort(function(a, b) {
            return a.timestamp - b.timestamp;
          });
          return arr;
        });
      },
    
      log: function(from, to, text) {
        var now = new Date().getTime(),
          obj = {
            from: from, 
            to: to,
            text: text,
            previous: {}
          };
        return privateClient.getObject('last/'+from).then(function(lastSeenFrom) {        
          previous[from] = lastSeenFrom.timestamp;//TODO: same for to: addresses
          return privateClient.storeObject('messages/'+timeToPath(now), obj).then(function() {
            storeLast(from);
            for(var i=0; i<to.length; i++) {
              storeLast(to[i], now);
            }
          });
        });
      }
    }
  };
});

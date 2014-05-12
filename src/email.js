RemoteStorage.defineModule('email', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
  var credentialsStore = CredentialsStore('email', privClient);

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
          objectType: 'credentials',
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

  function mergeObjects(existing, adding) {
    var i;
    if((typeof(adding) != 'object') || (typeof(existing) != 'object')) {
      return existing;
    }
    if(Array.isArray(existing)) {
      if(Array.isArray(adding)) {
        for(i=0; i<adding.length; i++) {
          if(existing.indexOf(adding[i]) == -1) {
            existing.push(adding[i]);
          }
        }
        return existing;
      } else {
        return Array.concat(existing, [adding]);
      }
    }
    if(Array.isArray(adding)) {
      return existing;
    }
    for(i in adding) {
      if(typeof(adding[i]=='object') && typeof(existing[i])) {
        existing[i]=mergeObjects(existing[i], adding[i]);
      }
      if(!existing[i]) {
        existing[i] = adding[i];
      }
    }
    return existing;
  }

  var messages = PrefixTree(privClient.scope('messages/'));
  return {
    exports: {
      _init: function() {
        privClient.cache('', 'ALL');
      },
      getMessage: function(msgId) {
        return messages.getObject(msgId);
      },
      getMessageIds: function(prefix) {
        return messages.getKeysAndDirs(prefix || '');
      },
      getImapBoxIndex: function(account, box) {
        return privClient.getAll('imap/'+account+'/'+box+'/', false);
      },
      getNextMissingSequence: function(account, box) {
        return privClient.getAll('imap/'+account+'/'+box+'/', false).then(
          function(map) {
            var i, highest=0, start;
            for(i in map) {
              if(parseInt(i)>highest) {
                highest = i;
              }
              console.log('highest? ', i, highest);
            }
            for(i=highest;i>=0;i--) {
              if(map[i] || i===0) {
                if(start) {
                  return 'highest:'+highest+', start:'+start+', end:'+(parseInt(i)+1)
                    +', suggestion: document.fetchEmails('+(1+Math.floor((highest-start)/10))+', '+10+', false);';
                }
              } else {
                if(!start) {
                  start = parseInt(i);
                }
              }
            }
            return 'up to date! highest:'+highest+', start:'+start+', end:'+(parseInt(i)+1)+', map:'+JSON.stringify(map);
          }
        );
      },
      storeMessage: function(msgId, obj, accountName) {
        var existing = messages.getObject(msgId) || {},
          merge = JSON.parse(JSON.stringify(mergeObjects(existing, obj)));//to avoid DataCloneError
        //console.log('merged', existing, obj, merge);
        return messages.storeObject('message', msgId, merge).then(function() {
          return privClient.storeObject('imapSeqno-to-messageId', 'imap/'+obj.object.imapAccountName+'/'+obj.object.imapBoxName+'/'+obj.object.imapSeqNo, {
            account: accountName,
            box: 'INBOX',
            seqNo: obj.object.imapSeqNo,
            messageId: msgId
          });
        });
      },
      setConfig: credentialsStore.setConfig,
      getConfig: credentialsStore.getConfig
    }
  };
});
remoteStorage.email._init();

RemoteStorage.defineModule('contacts', function(privateClient, publicClient) {
  var myName, contacts;

  function genUuid() {
    return Math.random()+'-'+(new Date().getTime().toString())+Math.random();
  }
  return {
    exports: {
      _init: function() {
        console.log('caching contacts');
        privateClient.cache('');
        myName = new SyncedVar('myname', privateClient);
        contacts = new SyncedMap('contacts', privateClient);
      },
      add: function(name, details) {
        if(contacts.get(name.toLowerCase())) {
          //throw new Error('name clash!');
        } else {
          details.id=genUuid();
          contacts.set(name.toLowerCase(), details);
          if(details.me) {
            myName.set(name);
          }
        }
      },
      remove: function(name) {
        contacts.remove(name.toLowerCase());
      },
      addFromList: function(list) {
        if(!Array.isArray(list)) {
          list = [list];
        }
        //console.log('adding contacts', list);
        var i;
        for(i=0; i<list.length; i++) {
          if(typeof(list[i]) === 'object') {
            this.add(list[i].name || list[i].address, list[i]);
          }
        }
      },
      getMyName: function() {
        return myName.get();
      },
      get: function(name) {
        return contacts.get(name);
      },
      getNames: function() {
        return contacts.getKeys();
      },
      find: function(str) {
        var results = {}, i, names = this.getNames();
        for (i=0; i<names.length; i++) {
          if (names[i].toLocaleLowerCase().indexOf(str.toLocaleLowerCase()) !== -1) {
            results[names[i]] = this.get(names[i]);
          }
        }
        return results;
      },
      getEverything: function() {
        var promise = promising();
        promise.fulfill({
          myName: myName.get(),
          contacts: contacts.getEverything()
        }); 
        return promise;
      },
      setEverything: function(obj) {
        if(obj && obj.myName) {
          myName.set(obj.myName);
        }
        if(obj && obj.contacts) {
          contacts.setEverything(obj.contacts);
        }
      },
      contacts: contacts
    }
  };
});
remoteStorage.contacts._init();
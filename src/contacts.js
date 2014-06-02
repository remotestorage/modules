/**
 * File: Contacts
 *
 * Maintainer: Michiel de Jong <michiel@unhosted.org>
 * Version: -    0.2.0
 *
 */
if(! RemoteStorage) {
  RemoteStorage = remoteStorage;
}

RemoteStorage.defineModule('contacts', function (privateClient, publicClient) {

  /**
   *
   * Apart from the 'contacts' module, this file contains a
   * proof-of-concept ngrams based search index.
   *
   * The code is highly redundant and needs refactoring for real-world
   * usecases. However - it works!
   *
   */

  var util = remoteStorage.util;

  var indexPathPrefix = 'index/';

  function rmRf(path) {
    if(util.isDir(path)) {
      return privateClient.getListing(path).then(function (items) {
        return util.asyncEach(items, function (item) {
          return rmRf(path + item);
        });
      });
    } else {
      return privateClient.remove(path);
    }
  }

  /**
   * Schema: http://www.w3.org/2006/vcard/ns
   *
   * Contact
   *
   * See  http://www.w3.org/TR/2014/NOTE-vcard-rdf-20140522/
   * 
   * Properties:
   *   fn - Formatted name (required)
   *   hasEmail - email address URI like `mailto:user@host.com` (string)
   */
  privateClient.declareType('contact', 'http://www.w3.org/2006/vcard/ns', {
    'type': 'object',
    'properties': {
      'fn': {
        'description': 'Formatted Name',
        'type': 'string',
        'required': true
      },
      'hasEmail': { 'type': 'string' }
    }
  });

  function indexNodePath(type, attributeKey, attributeValue) {
    return indexPathPrefix + type + '/' + encodeURIComponent(attributeKey) + '/' + encodeURIComponent(attributeValue);
  }

  function queryIndex(type, attributeKey, attributeValue) {
    return privateClient.getObject(indexNodePath(type, attributeKey, attributeValue)).
      then(function (list) {
        if(! list) {
          return [];
        } else {
          return util.asyncMap(list, function (id) {
            return privateClient.getObject('card/' + id);
          });
        }
      });
  }

  function indexAttribute(type, id, attributeKey, attributeValue) {
    var path = indexNodePath(type, attributeKey, attributeValue);
    return privateClient.getObject(path).then(function (list) {
      return privateClient.storeObject('index-node', path, (list || []).concat([id]));
    });
  }

  function unindexAttribute(type, id, attributeKey, attributeValue) {
    var path = indexNodePath(type, attributeKey, attributeValue);
    return privateClient.getObject(path).then(function (list) {
      var newList = [];
      if(list) {
        list.forEach(function (item) {
          if(item !== id) {
            newList.push(item);
          }
        });
        return privateClient.storeObject(path);
      }
    });
  }

  var INDEX_ATTRIBUTES = { email: true, impp: true };
  var INDEX_ATTRIBUTE_KEYS = Object.keys(INDEX_ATTRIBUTES);

  function indexContact(contact) {
    return util.asyncEach(INDEX_ATTRIBUTE_KEYS, function (key) {
      return indexAttribute('contact', contact.id, key, contact[key]);
    });
  }

  function unindexContact(contact) {
    return util.asyncEach(INDEX_ATTRIBUTE_KEYS, function (key) {
      return unindexAttribute('contact', contact.id, key, contact[key]);
    });
  }

  return {
    exports: {

      on: privateClient.on,

      getAll: function () {
        return privateClient.getListing('card/').then(function (ids) {
          if (typeof ids !== 'undefined') {
            return util.asyncMap(ids, function (id) {
              if (typeof id !== 'undefined') {
                return privateClient.getObject('card/' + id);
              }
            });
          }
        });
      },

      byKey: function (key, value) {
        if(! INDEX_ATTRIBUTES[key]) {
          throw new Error('Key "' + key + '" is not indexed!');
        }
        return queryIndex('contact', key, value);
      },

      add: function (contact) {
        return this.save(contact);
      },

      save: function (contact) {
        if (!contact.id) {
          contact.id = privateClient.uuid();
        }
        return privateClient.storeObject('contact', 'card/' + contact.id, contact).
          then(function () {
            // don't wait until indexing is done. instead return immediately.
            indexContact(contact);
          });
      },

      get: function (uuid) {
        return privateClient.getObject('card/' + uuid);
      },

      remove: function (contact) {
        return privateClient.remove('card/' + contact.id).
          then(function () {
            unindexContact(contact);
          });
      },

      rebuildIndex: function () {
        return this.clearIndex().
          then(this.all).
          then(function (contacts) {
            return util.asyncEach(contacts, indexContact);
          });
      },

      clearIndex: function () {
        return rmRf('index/');
      }

    }
  };
});

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * File: Contacts
 *
 * Maintainer: - Michiel de Jong <michiel@unhosted.org>
 * Version:    - 0.2.0
 *
 */
"use strict";

if (!RemoteStorage) {
  RemoteStorage = remoteStorage;
}

RemoteStorage.defineModule("contacts", function (privateClient, publicClient) {

  /**
   *
   * Apart from the 'contacts' module, this file contains a
   * proof-of-concept ngrams based search index.
   *
   * The code is highly redundant and needs refactoring for real-world
   * usecases. However - it works!
   *
   */

  var util = RemoteStorage.util;

  var indexPathPrefix = "index/";

  function rmRf(path) {
    if (util.isDir(path)) {
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
   * Here, we only specify the most commonly used vcard fields, which is
   * already more than what is used in practice by the apps that use this
   * module. If you want to use a vcard field that is not listed here,
   * please refer to http://www.w3.org/TR/2014/NOTE-vcard-rdf-20140522/
   * for the full list.
   *
   * Properties:
   *   fn - Formatted name (required)
   *   hasFamilyName - family name (string)
   *   hasGivenName - given name (string)
   *   hasNickName - nickname (string)
   *   hasEmail - email address URI like `mailto:user@host.com` (string)
   *   hasTelephone - telephone number (string)
   *   hasURL - personal website URL (string)
   *   bday - birthday (date string)
   *   tz - preferred timezone of the person (string)
   */
  privateClient.declareType("contact", "http://www.w3.org/2006/vcard/ns", {
    type: "object",
    properties: {
      fn: {
        description: "Formatted Name",
        type: "string",
        required: true
      },
      hasEmail: { type: "string" },
      hasFamilyName: { type: "string" },
      hasGivenName: { type: "string" },
      hasNickName: { type: "string" },
      hasTelephone: { type: "string" },
      hasURL: { type: "string" },
      bday: { type: "string" },
      tz: { type: "string" }
    }
  });

  function indexNodePath(type, attributeKey, attributeValue) {
    return indexPathPrefix + type + "/" + encodeURIComponent(attributeKey) + "/" + encodeURIComponent(attributeValue);
  }

  function queryIndex(type, attributeKey, attributeValue) {
    return privateClient.getObject(indexNodePath(type, attributeKey, attributeValue)).then(function (list) {
      if (!list) {
        return [];
      } else {
        return util.asyncMap(list, function (id) {
          return privateClient.getObject("card/" + id);
        });
      }
    });
  }

  function indexAttribute(type, id, attributeKey, attributeValue) {
    var path = indexNodePath(type, attributeKey, attributeValue);
    return privateClient.getObject(path).then(function (obj) {
      return privateClient.storeObject("index-node", path, {
        list: (obj.list || []).concat([id])
      });
    });
  }

  function unindexAttribute(type, id, attributeKey, attributeValue) {
    var path = indexNodePath(type, attributeKey, attributeValue);
    return privateClient.getObject(path).then(function (obj) {
      var newList = [];
      if (obj.list) {
        obj.list.forEach(function (item) {
          if (item !== id) {
            newList.push(item);
          }
        });
        return privateClient.storeObject("index-node", path, {
          list: newList
        });
      }
    });
  }

  var INDEX_ATTRIBUTES = { email: true, impp: true };
  var INDEX_ATTRIBUTE_KEYS = Object.keys(INDEX_ATTRIBUTES);

  function indexContact(contact) {
    return util.asyncEach(INDEX_ATTRIBUTE_KEYS, function (key) {
      return indexAttribute("contact", contact.id, key, contact[key]);
    });
  }

  function unindexContact(contact) {
    return util.asyncEach(INDEX_ATTRIBUTE_KEYS, function (key) {
      return unindexAttribute("contact", contact.id, key, contact[key]);
    });
  }

  return {
    exports: {

      on: privateClient.on,

      getAll: function getAll() {
        return privateClient.getAll("card/");
      },

      byKey: function byKey(key, value) {
        if (!INDEX_ATTRIBUTES[key]) {
          throw new Error("Key \"" + key + "\" is not indexed!");
        }
        return queryIndex("contact", key, value);
      },

      add: function add(contact) {
        return this.save(contact);
      },

      save: function save(contact) {
        if (!contact.id) {
          contact.id = privateClient.uuid();
        }
        return privateClient.storeObject("contact", "card/" + contact.id, contact).then(function () {
          // don't wait until indexing is done. instead return immediately.
          indexContact(contact);
        });
      },

      get: function get(uuid) {
        return privateClient.getObject("card/" + uuid);
      },

      remove: function remove(contact) {
        return privateClient.remove("card/" + contact.id).then(function () {
          unindexContact(contact);
        });
      },

      rebuildIndex: function rebuildIndex() {
        return this.clearIndex().then(this.all).then(function (contacts) {
          return util.asyncEach(contacts, indexContact);
        });
      },

      clearIndex: function clearIndex() {
        return rmRf("index/");
      }

    }
  };
});

},{}]},{},[1]);

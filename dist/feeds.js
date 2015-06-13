(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/basti/src/remotestorage/modules/src/feeds.js":[function(require,module,exports){
/**
 * File: Feeds
 *
 * Maintainer: - Nick Jennings <nick@silverbucket.net>
 * Version:    - 1.0.0
 *
 * This module stores RSS/Atom feeds. It is used by https://dogfeed.5apps.com/
 *
 */

"use strict";

RemoteStorage.defineModule("feeds", function (privateClient, publicClient) {

  var extend = RemoteStorage.util.extend;
  var md5sum = RemoteStorage.util.md5sum;

  var baseProperties = {
    id: {
      type: "string",
      description: "md5sum of link as ID"
    },
    url: {
      type: "string",
      description: "URL of the RSS feed",
      format: "uri"
    },
    title: {
      type: "string",
      description: "human readable title of the feed"
    },
    description: {
      type: "string",
      description: "human readable description of feed"
    },
    image: {
      type: "string",
      description: "url of feed image (logo)"
    },
    favicon: {
      type: "string",
      description: "url of feeds favicon"
    },
    language: {
      type: "string",
      description: "language of feed"
    },
    numArticlesToCache: {
      type: "number",
      description: "number of articles to store starting from latest"
    },
    fetchedAt: {
      type: "number",
      description: "last time feed was fetched"
    },
    createdAt: {
      type: "number",
      description: "date feed was added"
    },
    updatedAt: {
      type: "number",
      description: "date feed was added"
    },
    "@context": {
      type: "string",
      format: "uri"
    }
  };

  privateClient.declareType("rss-atom-feed", {
    key: "id",
    type: "object",
    required: ["id", "url", "createdAt", "updatedAt", "@context"],
    additionalProperties: false,
    properties: extend({
      author: {
        type: "string",
        description: "author of feed"
      }
    }, baseProperties)
  });

  var generateBaseMethods = function generateBaseMethods(type) {

    var scopedClient = privateClient.scope(type + "/");

    return {

      on: scopedClient.on.bind(scopedClient),

      /**
       * Function: remove
       *
       * Remove the record, as specified by url.
       *
       * Parameters:
       *
       *   url - url of record to remove
       *
       * Returns:
       *
       *   return a promise which is resolved upon successful deletion of record.
       */
      remove: function remove(url) {
        if (typeof url !== "string") {
          return Promise.reject("Required param 'url' not specified.");
        }
        var id = md5sum(url);
        return scopedClient.remove(id);
      },

      /**
       * Function: create
       *
       * Add a new record.
       *
       * Parameters:
       *
       *   obj  - the JSON object to use
       *
       * Returns:
       *
       *   return a promise which is resolved with the saved object upon completion
       *          (with fields `id` and `date_created` etc.)
       */
      create: function create(obj) {
        if (typeof obj.url !== "string") {
          return Promise.reject("Required property 'url' not found in object.");
        }

        obj.id = md5sum(obj.url);

        var timestamp = new Date().getTime();
        obj.createdAt = timestamp;
        obj.updatedAt = timestamp;

        return scopedClient.storeObject(type, obj.id, obj).then(function () {
          return obj;
        });
      },

      /**
       * Function: update
       *
       * Update an existing record.
       *
       * Parameters:
       *
       *   obj  - the JSON object to use (must contain existing ID)
       *
       * Returns:
       *
       *   return a promise which is resolved with the updated object upon completion
       *
       */
      update: function update(obj) {
        if (!obj.id) {
          return Promise.reject("Object has no 'id' property, cannot update.");
        }
        obj.updatedAt = new Date().getTime();

        return scopedClient.storeObject(type, obj.id, obj).then(function () {
          return obj;
        });
      },

      /**
       * Function: get
       *
       * Get a record by url
       *
       * Parameters:
       *
       *   url - url of record to fetch.
       *
       * Returns:
       *
       *   return a promise which is resolved with the desired object if it exists.
       */
      get: function get(url) {
        if (typeof url !== "string") {
          return Promise.reject("Required param 'url' not specified.");
        }
        var id = md5sum(url);
        console.log("fetching: [" + url + "] ", id);
        return scopedClient.getObject(id);
      },

      md5sum: md5sum,

      getAll: scopedClient.getAll.bind(scopedClient),

      getListing: scopedClient.getListing.bind(scopedClient)
    };
  };

  return {

    exports: {

      on: privateClient.on.bind(privateClient),

      rssAtom: generateBaseMethods("rss-atom-feed")

    }

  };
});

},{}]},{},["/home/basti/src/remotestorage/modules/src/feeds.js"]);

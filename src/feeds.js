/**
 * File: Feeds
 *
 * Nick Jennings <nick@silverbucket.net>
 *
 * Version:    - 0.2.1
 *
 * This module stores RSS/Atom feeds. It is used by https://dogfeed.5apps.com/
 *
 */

RemoteStorage.defineModule('feeds', function(privateClient, publicClient) {

  var extend = RemoteStorage.util.extend;
  var md5sum = RemoteStorage.util.md5sum;

  var baseProperties = {
    "id" : {
      "type": "string",
      "description": "md5sum of link as ID"
    },
    "url": {
      "type": "string",
      "description": "URL of the RSS feed",
      "format": "uri"
    },
    "title": {
      "type": "string",
      "description": "human readable title of the feed"
    },
    "description": {
      "type": "string",
      "description": "human readable description of feed"
    },
    "image": {
      "type": "string",
      "description": "url of feed image (logo)"
    },
    "favicon": {
      "type": "string",
      "description": "url of feeds favicon"
    },
    "language": {
      "type": "string",
      "description": "language of feed"
    },
    "cache_articles": {
      "type": "number",
      "description": "number of articles to store starting from latest"
    },
    "last_fetched": {
      "type": "number",
      "description": "last time feed was fetched"
    },
    "date_added": {
      "type": "number",
      "description": "date feed was added"
    },
    "date_updated": {
      "type": "number",
      "description": "date feed was added"
    },
    "@context": {
      "type": "string",
      "format": "uri"
    }
  };

  privateClient.declareType('rss-atom-feed', {
    "key": "id",
    "type": "object",
    "required": ["id", "url", "date_added", "date_updated", "@context"],
    "additionalProperties": false,
    "properties": extend({
      "author": {
        "type": "string",
        "description": "author of feed"
      }
    }, baseProperties)
  });


  var feeds = {

    on: privateClient.on.bind(privateClient),

    remove: function (url) {
      if (typeof url !== 'string') {
        return Promise.reject('require param \'url\' not specified');
      }
      var id = md5sum(url);
      return privateClient.remove(id);
    },

    add: function (type, obj) {
      if (typeof type !== 'string') {
        obj = type;
      }
      if (typeof obj.url === 'string') {
        obj.id = md5sum(obj.url);
      } else {
        return Promise.reject('require property \'url\' not found');
      }
      if (!obj.date_added) {
        obj.date_added = new Date().getTime();
      }
      obj.date_updated = new Date().getTime();

      return privateClient.storeObject('rss-atom-feed', obj.id, obj).then(function () {
        return obj;
      });
    },

    get: function (url) {
      if (typeof url !== 'string') {
        return Promise.reject('require param \'url\' not specified');
      }
      var id = md5sum(url);
      return privateClient.getObject(id);
    },

    md5sum: md5,

    getAll: privateClient.getAll.bind(privateClient),

    getListing: privateClient.getListing.bind(privateClient)
  };

  return { exports: feeds };
});

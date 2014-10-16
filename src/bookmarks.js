/**
 * File: Bookmarks
 *
 * Sebastian Kippe <basti@kip.pe>
 *
 * Version:    - 0.1.1
 *
 * This module stores bookmarks. It is used by https://webmarks.5apps.com/
 *
 */

RemoteStorage.defineModule('bookmarks', function (privateClient, publicClient) {

  var extend = RemoteStorage.util.extend;
  var md5sum = RemoteStorage.util.md5sum;

  //
  // Types
  //

  var baseProperties = {
    "id": {
      "type": "string"
    },
    "url": {
      "type": "string",
      "format": "uri"
    },
    "title": {
      "type": "string"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  };


  /**
   * Schema: bookmarks/archive-bookmark
   *
   * Represents an archived bookmark.
   *
   * Properties:
   *   id          - A string that uniquely identifies this bookmark (required)
   *   url         - The url of the bookmark (required)
   *   title       - The user-facing string describing the bookmark (required)
   *   createdAt   - DateTime string of when this bookmark was created
   *   description - Like title, but more elaborate
   *   tags        - Array of strings; use tags to give your bookmarks a loose grouping into categories
   *   thumbnail   - A base64-encoded screenshot of the bookmarked page
   */

  privateClient.declareType('archive-bookmark', {
    "type": "object",
    "properties": extend({
      "description": {
        "type": "string",
        "default": ""
      },
      "tags": {
        "type": "array",
        "default": []
      },
      "thumbnail": {
        "description": "A base64-encoded screenshot of the bookmarked page",
        "type": "string"
      }
    }, baseProperties),
    "required": [ "id", "title", "url" ]
  });

  /**
   * Schema: bookmarks/browser-bookmark
   *
   * Represents a bookmark that is not archived.
   *
   * Properties:
   *   id          - A string that uniquely identifies this bookmark
   *   url         - The url of the bookmark
   *   title       - The user-facing string describing the bookmark
   *   createdAt   - DateTime string of when this bookmark was created
   *   tags        - Array of strings; use tags to give your bookmarks a loose grouping into categories
   */

  privateClient.declareType('browser-bookmark', {
    "type": "object",
    "properties": extend({
      "tags": {
        "type": "array",
        "default": []
      }
    }, baseProperties)
  });

  /**
   * Schema: bookmarks/readlater-bookmark
   *
   * Represents a bookmark which the user marked for reading later.
   *
   * Properties:
   *   id          - A string that uniquely identifies this bookmark
   *   url         - The url of the bookmark
   *   title       - The user-facing string describing the bookmark
   *   createdAt   - DateTime string of when this bookmark was created
   *   unread      - Boolean, whether the bookmark is unread (default: true, required)
   */

  privateClient.declareType('readlater-bookmark', {
    "type": "object",
    "properties": extend({
      "unread": {
        "type": "boolean",
        "default": true,
        "required": true
      }
    }, baseProperties)
  });

  //
  // Public functions
  //

  var bookmarks = {

    archive: {

      find: function(id) {
        var path = "archive/" + id;

        return privateClient.getObject(path).then(function(bookmark){
          return bookmark;
        });
      },

      getAll: function() {
        return privateClient.getAll('archive/').then(
        // return privateClient.getAll('archive/', 'archive-bookmark').then(
          function(bookmarks) {
            console.log('got archive bookmarks', bookmarks);
            if (!bookmarks) {
              return [];
            }
            return Object.keys(bookmarks).map(function(id) {
              return bookmarks[id];
            });
          },
          function(error) {
            console.log("Something bad happened: ", error);
          });
      },

      store: function(bookmark) {
        bookmark.id = urlHash(bookmark.url);
        if (bookmark.createdAt) {
          bookmark.updatedAt = new Date().toISOString();
        } else {
          bookmark.createdAt = new Date().toISOString();
        }
        var path = "archive/" + bookmark.id;
        console.log(bookmark);

        return privateClient.storeObject("archive-bookmark", path, bookmark).
          then(function() {
            console.log(bookmark.id);
            return bookmark;
          });
      },

      remove: function(id) {
        var path = "archive/" + id;

        return privateClient.remove(path);
      },

      idForUrl: function(url) {
        return urlHash(url);
      }

    },

    client: privateClient

  };

  //
  // Helpers
  //

  var urlHash = function(url) {
    url = url; //TODO remove trailing slash
    return md5sum(url);
  };

  //
  // Return public functions
  //

  return { exports: bookmarks };

});


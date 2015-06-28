/**
 * File: Messages (IRC)
 *
 * Maintainer:      - Sebastian Kippe <sebastian@kip.pe>
 * Version:         - 0.2.0
 *
 * This module stores IRC messages in daily archive files.
 */

// TODO only load in node.js
// if (isNodeJs) {
RemoteStorage = require("remotestoragejs");
// }

RemoteStorage.defineModule("messages-irc", function (privateClient, publicClient) {

  /**
   * Schema: messages-irc/daily
   *
   * Represents one day of IRC messages (in UTC)
   *
   * Example:
   *
   * (start code)
   * {
   *   "@context": "https://kosmos.org/ns/v1",
   *   "@id": "messages/irc/freenode/channels/kosmos/",
   *   "@type": "ChatChannel",
   *   "name": "#kosmos",
   *   "ircURI": "irc://irc.freenode.net/kosmos",
   *   "today":  {
   *     "@id": "2015/01/01",
   *     "@type": "ChatLog",
   *     "messageType": "InstantMessage",
   *     "previous": "2014/12/31",
   *     "next": "2015/01/02",
   *     "messages": [
   *       { "date": "2015-06-05T17:35:28.454Z", "user": "hal8000", "text": "knock knock" },
   *       { "date": "2015-06-05T17:37:42.123Z", "user": "raucao", "text": "who's there?" },
   *       { "date": "2015-06-05T17:55:01.235Z", "user": "hal8000", "text": "HAL" }
   *     ]
   *   }
   * }
   * (end code)
   */

  const archiveSchema = {
    "type": "object",
    "properties": {
      "@context": {
        "type": "string",
        "default": "https://kosmos.org/ns/v1",
        "enum": ["https://kosmos.org/ns/v1"]
      },
      "@id": {
        "type": "string",
        "default": "messages-irc/freenode/kosmos/"
      },
      "@type": {
        "type": "string",
        "default": "ChatChannel",
        "enum": ["ChatChannel"]
      },
      "name": {
        "type": "string"
      },
      "ircURI": {
        "type": "string",
        "format": "uri"
      },
      "today": {
        "type": "object",
        "properties": {
          "@id": {
            "type": "string",
            "pattern": "^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$"
          },
          "@type": {
            "type": "string",
            "default": "ChatLog",
            "pattern": "^ChatLog$"
          },
          "messageType": {
            "type": "string",
            "default": "InstantMessage",
            "pattern": "^InstantMessage$"
          },
          "previous": {
            "type": "string",
            "pattern": "^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$"
          },
          "next": {
            "type": "string",
            "pattern": "^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$"
          },
          "messages": {
            "type": "array",
            "uniqueItems": true,
            "items": {
              "type": "object",
              "properties": {
                "date": {
                  "type": "string",
                  "format": "date-time"
                },
                "user": {
                  "type": "string"
                },
                "text": {
                  "type": "string"
                },
                "type": "string",
                "default": "text",
                "enum": [
                  "text",
                  "join",
                  "leave"
                ]
              }
            }
          }
        }
      }
    },
    "required": []
  }

  privateClient.declareType("daily-archive", "https://kosmos.org/ns/v1", archiveSchema);
  publicClient.declareType("daily-archive", "https://kosmos.org/ns/v1", archiveSchema);

  /**
   * Class: DailyArchive
   *
   * A daily archive stores IRC messages by day.
   *
   * Parameters:
   *   options - (Object) See class properties below for object properties
   *   TODO not all props are constructor args
   */
  // TODO move to common module for all messages modules
  var DailyArchive = function DailyArchive(options) {
    //
    // Defaults
    //
    options.isPublic = options.isPublic || false;

    //
    // Validate options
    //
    if (typeof options !== "object") {
      throw "options must be an object";
    }
    if (typeof options.network !== "object" ||
        typeof options.network.name !== "string" ||
        typeof options.network.ircURI !== "string") {
      throw "network must be an object containing server \"name\" and \"ircURI\"";
    }
    if (typeof options.channelName !== "string") {
      throw "channelName must be a string";
    }
    if (!(options.date instanceof Date)) {
      throw "date must be a date object";
    }
    if (typeof options.isPublic !== "boolean") {
      throw "isPublic must be a boolean value";
    }

    /**
     * Property: network
     *
     * Contains information about the IRC network
     *
     * Properties:
     *   name - Shortname/id of network (e.g. "freenode")
     *   ircURI - IRC URI of network (e.g. "irc://irc.freenode.net/")
     */
    this.network = options.network;

    /**
     * Property: channelName
     *
     * Name of the IRC channel (e.g. "#kosmos")
     */
    this.channelName = options.channelName;

    /**
     * Property: date
     *
     * Date of the archive's content
     */
    this.date = options.date;

    /**
     * Property: isPublic
     *
     * `true` for public archives, `false` for private ones
     */
    this.isPublic = options.isPublic;

    /**
     * Property: parsedDate
     *
     * Object containing padded year, month and day of date
     */
    this.parsedDate = parseDate(this.date);

    /**
     * Property: dateId
     *
     * Date string in the form of YYYY/MM/DD
     */
    this.dateId = this.parsedDate.year+'/'+this.parsedDate.month+'/'+this.parsedDate.day

    /**
     * Property: path
     *
     * Document path of the archive file
     */
    if (this.channelName.match(/^#/)) {
      var channelName = this.channelName.replace(/#/,'');
      this.path = this.network.name+"/channels/"+channelName+"/"+this.dateId;
    } else {
      this.path = this.network.name+"/users/"+this.channelName+"/"+this.dateId;
    }

    /**
     * Property: client
     *
     * Public or private BaseClient, depending on isPublic
     */
    this.client = this.isPublic ? publicClient : privateClient;
  };

  DailyArchive.prototype = {
    /*
     * Method: addMessage
     *
     * Parameters (object):
     *   timestamp - Timestamp of the message
     *   from      - The sender of the message
     *   text      - The message itself
     *   type      - Type of message (one of text, join, leave, action)
     */
    addMessage: function addMessage(message) {
      if (this.isPublic && !this.channelName.match(/^#/)) { return false; }

      var self = this;
      message.type = message.type || 'text';

      self.client.getObject(self.path).then(function(archive) {
        if (typeof archive === 'object') {
          self._updateDocument(archive, message);
        } else {
          self._createDocument(message);
        }
      }, function(error) {
        // our connection to the storage is not healthy it would seem
      });
    },

    /*
     * Method: addMessages
     *
     * Like <addMessage>, but for multiple messages at once. Useful for bulk
     * imports of messages.
     *
     * Parameters:
     *   messages   - Array of message objects (see params for addMessage)
     *   overwrite  - If true, creates a new archive file and overwrites the
     *                old one. Defaults to false.
     */
    addMessages: function addMessage(messages, overwrite) {
      if (this.isPublic && !this.channelName.match(/^#/)) { return false; }

      var self = this;
      overwrite = overwrite || false;

      messages.forEach(function(message) {
        message.type = message.type || 'text';
      });

      if (overwrite) {
        self._createDocument(messages);
      } else {
        self.client.getObject(this.path).then(function(archive) {
          if (typeof archive === 'object') {
            self._updateDocument(archive, messages);
          } else {
            self._createDocument(messages);
          }
        }, function(error) {
          // our connection to the storage is not healthy it would seem
        });
      }
    },

    /*
     * Method: remove
     *
     * Deletes the entire archive document from storage
     */
    remove: function() {
      return this.client.remove(this.path);
    },

    /*
     * Method: _updateDocument
     *
     * Updates and writes an existing archive document
     */
    _updateDocument: function(archive, messages) {
      RemoteStorage.log('[messages-irc] Updating archive document', archive);

      if (Array.isArray(messages)) {
        messages.forEach(function(message) {
          archive.today.messages.push(message);
        });
      } else {
        archive.today.messages.push(messages);
      }

      this._sync(archive);
    },

    /*
     * Method: _createDocument
     *
     * Creates and writes a new archive document
     */
    _createDocument: function(messages) {
      RemoteStorage.log('[messages-irc] Creating new archive document');
      var self = this;
      var archive = self._buildArchiveObject();

      if (Array.isArray(messages)) {
        messages.forEach(function(message) {
          archive.today.messages.push(message);
        });
      } else {
        archive.today.messages.push(messages);
      }

      self._updatePreviousArchive().then(function(previous) {
        if (typeof previous === 'object') {
          archive.today.previous = previous.today['@id'];
        }
        self._sync(archive);
      });
    },

    /*
     * Method: _buildArchiveObject
     *
     * Builds the object to be stored in remote storage
     */
    _buildArchiveObject: function() {
      var id;
      if (this.channelName.match(/^#/)) {
        var channelName = this.channelName.replace(/#/,'');
        id = "messages-irc/"+this.network.name+"/channels/"+channelName+"/";
      } else {
        id = "messages-irc/"+this.network.name+"/users/"+channelName+"/";
      }
      return {
        "@id": id,
        "@type": "ChatChannel",
        "name": this.channelName,
        "ircURI": this.network.ircURI+"/"+this.channelName.replace(/#/,''),
        "today": {
          "@id": this.dateId,
          "@type": "ChatLog",
          "messageType": "InstantMessage",
          // "previous": null,
          // "next": null,
          "messages": []
        }
      };
    },

    /*
     * Method: _updatePreviousArchive
     *
     * Finds the last archive document and updates its today.next value
     */
    _updatePreviousArchive: function() {
      var pending = Promise.defer();
      // TODO find and update previous archive
      // pending.resolve({today: {'@id': '2015/06/23'}});
      pending.resolve('nope');
      return pending.promise;
    },

    /*
     * Method: _sync
     *
     * Write archive document
     */
    _sync: function(obj) {
      RemoteStorage.log('[messages-irc] Writing archive object', obj);

      this.client.storeObject('daily-archive', this.path, obj).then(function(){
        RemoteStorage.log('[messages-irc] Archive written to remote storage');
      },function(error){
        RemoteStorage.log('[messages-irc] Error trying to store object', error);
      });
    }
  };

  var parseDate = function(date) {
    var pad = function(num) {
      num = String(num);
      if (num.length === 1) { num = "0" + num; }
      return num;
    };

    return {
      year:  date.getUTCFullYear(),
      month: pad( date.getUTCMonth() + 1 ),
      day:   pad( date.getUTCDate() )
    };
  };

  // TODO move to module
  var arrayUnique = function(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i] === a[j])
          a.splice(j--, 1);
      }
    }
    return a;
  };

  var exports = {
    DailyArchive: DailyArchive,
    privateClient: privateClient,
    publicClient: publicClient
  };

  // Return public functions
  return { exports: exports };
});

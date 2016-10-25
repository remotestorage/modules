/**
 * File: Chat Messages
 *
 * Maintainer:      - Sebastian Kippe <sebastian@kip.pe>
 * Version:         - 0.6.0
 *
 * This module stores chat messages in daily archive files.
 */

var isNode = new Function("try {return this===global;}catch(e){return false;}");
if (isNode) { var RemoteStorage = require("remotestoragejs"); }

RemoteStorage.defineModule("chat-messages", function (privateClient, publicClient) {

  /**
   * Schema: chat-messages/daily
   *
   * Represents one day of chat messages
   *
   * Example:
   *
   * (start code)
   * {
   *   "@context": "https://kosmos.org/ns/v1",
   *   "@id": "chat-messages/freenode/channels/kosmos/",
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
        "required": true
      },
      "@type": {
        "type": "string",
        "default": "ChatChannel",
        "enum": ["ChatChannel"]
      },
      "name": {
        "type": "string",
        "required": true
      },
      "ircURI": {
        "type": "string",
        "format": "uri"
      },
      "xmppURI": {
        "type": "string",
        "format": "uri"
      },
      "today": {
        "type": "object",
        "properties": {
          "@id": {
            "type": "string",
            "pattern": "^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$",
            "required": true
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
            "required": true,
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
                  "leave",
                  "action"
                ]
              }
            }
          }
        }
      }
    },
    "required": []
  };

  privateClient.declareType("daily-archive", "https://kosmos.org/ns/v1", archiveSchema);
  publicClient.declareType("daily-archive", "https://kosmos.org/ns/v1", archiveSchema);

  /**
   * Class: DailyArchive
   *
   * A daily archive stores IRC messages by day.
   *
   * Parameters (object):
   *   server      - Chat server info (see <DailyArchive.server>)
   *   channelName - Name of room/channel
   *   date        - Date of archive day
   *   isPublic    - Store logs in public folder (defaults to false)
   *   previous    - Date of previous log file as YYYY/MM/DD;
   *                 looked up automatically when not given
   *   next        - Date of next log file as YYYY/MM/DD;
   *                 looked up automatically when not given
   *
   * Example for IRC:
   *
   * (start code)
   * var archive = new chatMessages.DailyArchive({
   *   server: {
   *     type: 'irc',
   *     name: 'freenode',
   *     ircURI: 'irc://irc.freenode.net'
   *   },
   *   channelName: '#kosmos',
   *   date: new Date(),
   *   isPublic: true
   * });
   * (end code)
   *
   * Example for XMPP:
   *
   * (start code)
   * var archive = new chatMessages.DailyArchive({
   *   server: {
   *     type: 'xmpp',
   *     name: '5apps',
   *     xmppMUC: 'muc.5apps.com'
   *   },
   *   channelName: 'watercooler',
   *   date: new Date(),
   *   isPublic: false
   * });
   * (end code)
   */
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
    if (typeof options.server !== "object" ||
        typeof options.server.type !== "string" ||
        typeof options.server.name !== "string") {
      throw "server must be an object containing at least server \"type\" and \"name\"";
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
     * Property: server
     *
     * Contains information about the chat server/network
     *
     * Properties:
     *   type - Type of server/protocol (e.g. "irc", "xmpp", "campfire", "slack")
     *   name - Shortname/id/alias of network/server (e.g. "freenode", "mycompanyname")
     *   ircURI - (optional) IRC URI of network (e.g. "irc://irc.freenode.net/")
     *   xmppMUC - (optional) XMPP MUC service host (e.g. "conference.jabber.org")
     */
    this.server = options.server;

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
    this.dateId = this.parsedDate.year+'/'+this.parsedDate.month+'/'+this.parsedDate.day;

    /**
     * Property: path
     *
     * Document path of the archive file
     */
    switch (this.server.type) {
      case 'irc':
        if (this.channelName.match(/^#/)) {
          // normal chatroom
          var channelName = this.channelName.replace(/^#/,'');
          this.path = `${this.server.name}/channels/${channelName}/${this.dateId}`;
        } else {
          // user direct message
          this.path = `${this.server.name}/users/${this.channelName}/${this.dateId}`;
        }
        break;
      default:
        this.path = `${this.server.name}/${this.channelName}/${this.dateId}`;
        break;
    }

    /**
     * Property: client
     *
     * Public or private BaseClient, depending on isPublic
     */
    this.client = this.isPublic ? publicClient : privateClient;

    /**
     * Property: previous
     *
     * Date of previous log file as YYYY/MM/DD
     */
    this.previous = options.previous;

    /**
     * Property: next
     *
     * Date of next log file as YYYY/MM/DD
     */
    this.next = options.next;
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
      if (this.isPublic && !this.channelName.match(/^#/)) {
        return Promise.resolve(false);
      }

      message.type = message.type || 'text';

      return this.client.getObject(this.path).then((archive) => {
        if (typeof archive === 'object') {
          return this._updateDocument(archive, message);
        } else {
          return this._createDocument(message);
        }
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
      if (this.isPublic && !this.channelName.match(/^#/)) {
        return Promise.resolve(false);
      }

      overwrite = overwrite || false;

      messages.forEach(function(message) {
        message.type = message.type || 'text';
      });

      if (overwrite) {
        return this._createDocument(messages);
      } else {
        return this.client.getObject(this.path).then((archive) => {
          if (typeof archive === 'object') {
            return this._updateDocument(archive, messages);
          } else {
            return this._createDocument(messages);
          }
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
      RemoteStorage.log('[chat-messages] Updating archive document', archive);

      if (Array.isArray(messages)) {
        messages.forEach(function(message) {
          archive.today.messages.push(message);
        });
      } else {
        archive.today.messages.push(messages);
      }

      return this._sync(archive);
    },

    /*
     * Method: _createDocument
     *
     * Creates and writes a new archive document
     */
    _createDocument: function(messages) {
      RemoteStorage.log('[chat-messages] Creating new archive document');
      let archive = this._buildArchiveObject();

      if (Array.isArray(messages)) {
        messages.forEach((message) => {
          archive.today.messages.push(message);
        });
      } else {
        archive.today.messages.push(messages);
      }

      if (this.previous || this.next) {
        // The app is handling previous/next keys itself
        // That includes setting 'next' in the previous log file
        if (this.previous) { archive.today.previous = this.previous; }
        if (this.next)     { archive.today.next = this.next; }
        return this._sync(archive);
      } else {
        // Find and update previous archive, set 'previous' on this one
        return this._updatePreviousArchive().then((previous) => {
          if (typeof previous === 'object') {
            archive.today.previous = previous.today['@id'];
          }
          return this._sync(archive);
        });
      }
    },

    /*
     * Method: _buildArchiveObject
     *
     * Builds the object to be stored in remote storage
     */
    _buildArchiveObject: function() {
      let roomName = this.channelName.replace(/#/,'');

      let archive = {
        "@id": "chat-messages/"+this.server.name+"/channels/"+roomName+"/",
        "@type": "ChatChannel",
        "name": this.channelName,
        "today": {
          "@id": this.dateId,
          "@type": "ChatLog",
          "messageType": "InstantMessage",
          "messages": []
        }
      };

      switch (this.server.type) {
        case 'irc':
          if (!this.channelName.match(/^#/)) {
            archive["@id"] = "chat-messages/"+this.server.name+"/users/"+this.channelName+"/";
          }
          archive["ircURI"] = this.server.ircURI+"/"+roomName;
          break;
        case 'xmpp':
          archive["xmppURI"] = `xmpp:${this.channelName}@${this.server.xmppMUC}`;
          break;
      }

      return archive;
    },

    /*
     * Method: _updatePreviousArchive
     *
     * Finds the previous archive document and updates its today.next value
     */
    _updatePreviousArchive: function() {
      return this._findPreviousArchive().then((archive) => {
        if (typeof archive === 'object' && archive.today) {
          archive.today.next = this.dateId;
          let path = this.path.substring(0, this.path.length-this.dateId.length)+archive.today['@id'];

          return this.client.storeObject('daily-archive', path, archive).then(() => {
            RemoteStorage.log('[chat-messages] Previous archive written to remote storage', path, archive);
            return archive;
          });
        } else {
          RemoteStorage.log('[chat-messages] Previous archive not found');
          return false;
        }
      });
    },

    /*
     * Method: _findPreviousArchive
     *
     * Returns the previous archive document
     */
    _findPreviousArchive: function() {
      const monthPath = this.path.substring(0, this.path.length-2);
      const yearPath = this.path.substring(0, this.path.length-5);
      const basePath = this.path.substring(0, this.path.length-10);

      return this.client.getListing(monthPath).then((listing) => {
        let days = Object.keys(listing).map((i) => parseInt(i)).map((i) => {
          return (i < parseInt(this.parsedDate.day)) ? i : null;
        }).filter(function(i){ return i != null;  });

        if (days.length > 0) {
          let day = pad(Math.max(...days).toString());
          return this.client.getObject(monthPath+day);
        }

        // Find last day in previous month
        return this.client.getListing(yearPath).then((listing) => {
          let months = Object.keys(listing).map((i) => parseInt(i.substr(0,2))).map((i) => {
            return (i < parseInt(this.parsedDate.month)) ? i : null;
          }).filter(function(i){ return i != null; });

          if (months.length > 0) {
            let month = pad(Math.max(...months).toString());

            return this.client.getListing(yearPath+month+'/').then((listing) => {
              let days = Object.keys(listing).map((i) => parseInt(i));
              let day = pad(Math.max(...days).toString());
              return this.client.getObject(yearPath+month+'/'+day);
            });
          } else {
            // Find last month and day in previous year
            return this.client.getListing(basePath).then((listing) => {

              let years = Object.keys(listing).map((i) => parseInt(i.substr(0,4))).map((i) => {
                return (i < parseInt(this.parsedDate.year)) ? i : null;
              }).filter(function(i){ return i != null; });

              if (years.length > 0) {
                let year = Math.max(...years).toString();

                return this.client.getListing(basePath+year+'/').then((listing) => {
                  let months = Object.keys(listing).map((i) => parseInt(i.substr(0,2)));
                  let month = pad(Math.max(...months).toString());

                  return this.client.getListing(basePath+year+'/'+month+'/').then((listing) => {
                    let days = Object.keys(listing).map((i) => parseInt(i));
                    let day = pad(Math.max(...days).toString());
                    return this.client.getObject(basePath+year+'/'+month+'/'+day);
                  });
                });
              } else {
                return false;
              }
            });
          }
        });
      });
    },

    /*
     * Method: _sync
     *
     * Write archive document
     */
    _sync: function(obj) {
      RemoteStorage.log('[chat-messages] Writing archive object', obj);

      return this.client.storeObject('daily-archive', this.path, obj).then(function(){
        RemoteStorage.log('[chat-messages] Archive written to remote storage');
        return true;
      },function(error){
        console.log('[chat-messages] Error trying to store object', error);
        return error;
      });
    }
  };

  var pad = function(num) {
    num = String(num);
    if (num.length === 1) { num = "0" + num; }
    return num;
  };

  var parseDate = function(date) {
    return {
      year:  date.getUTCFullYear(),
      month: pad( date.getUTCMonth() + 1 ),
      day:   pad( date.getUTCDate() )
    };
  };

  var exports = {
    DailyArchive: DailyArchive,
    privateClient: privateClient,
    publicClient: publicClient
  };

  // Return public functions
  return { exports: exports };
});

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * File: Messages
 *
 * Nick Jennings <nick@silverbucket.net>
 * Niklas E. Cathor <nilclass@riseup.net>
 *
 * Version:    - 0.1.0
 *
 * This module stores messages and drafts, as well as credentials for
 * all of the various messaging protocols.
 */

"use strict";

RemoteStorage.defineModule("messages", function (privateClient, publicClient) {

  /**
   * Using the message index:
   *
   *
   *   messages.account('xmpp:user@server.com').then(function(account) {
   *     account.store({
   *       object: {
   *         date: ...
   *         subject: ...
   *         text: ...
   *         html: ...
   *       },
   *       target: [
   *         {
   *           name: ...
   *           address: ...
   *         }
   *       ]
   *     });
   *   }, function(err) {
   *     console.log('Could not open messages account', err);
   *   });
   *
   *   // will store at:
   *   //   /messages/accounts/xmpp:user@server.com/pool/<year>/<month>/<day>/
   *   //     <hour>-<minute>-<second>-<message-id>
   *
   *   messages.account('xmpp:user@server.com').list({
   *     limit: 50,
   *     order: 'desc'
   *   });
   *   // returns the 50 latest messages (this is also the defaults)
   *
   *   messages.account('mailto:john.doe@yahoo.com').list({
   *     limit: 5,
   *     order: 'asc'
   *   });
   *   // returns the 5 oldest messages from 'sent' folder
   *
   */

  /**
   * Schema: email.recipient
   *
   * Represents a recipient of a message.
   *
   * Properties:
   *   name    - Name of the recipient
   *   address - RFC822 compliant address (i.e. an email address)
   */

  /**
   * Schema: messages/draft
   *
   * Represents a saved message that hasn't been sent yet.
   *
   * Properties:
   *   actor    - Sender of the message. Same properties as <email.recipient>.
   *   target      - Array of <email.recipient> objects (including cc and bcc).
   *   object.subject - Message subject (a String).
   *   object.text    - Message body (a String).
   *   object.date    - Message date. For a draft this is set to last time
   *             the draft was saved.
   */
  privateClient.declareType("draft", {

    description: "can be small (entry in the chat log) or big (email with CC's attachments)",
    properties: {
      platform: {
        type: "string",
        required: true
      },
      actor: {
        type: "object",
        properties: {
          name: {
            type: "string",
            required: false
          },
          address: {
            type: "string",
            required: true,
            pattern: "^[a-zA-Z0-9]+"
          }
        }
      },
      target: {
        type: "array",
        required: true,
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              required: false
            },
            address: {
              type: "string",
              required: false
            },
            field: {
              type: "string",
              description: "cc, bcc, to, etc.",
              required: false
            },
            platform: {
              type: "string",
              description: "type of protocol used, xmpp, irc, email, etc.",
              required: false
            }
          }
        }
      },
      object: {
        type: "object",
        required: true,
        properties: {
          headers: {
            type: "object",
            required: false
          },
          subject: {
            type: "string",
            required: false
          },
          text: {
            type: "string",
            description: "human-readable message",
            required: false
          },
          html: {
            type: "string",
            description: "html formatted message",
            required: false
          },
          timestamp: {
            type: "timestamp",
            required: false
          },
          date: {
            type: "date",
            required: false
          },
          encrypt: {
            type: "boolean",
            "default": false
          },
          sign: {
            type: "boolean",
            "default": false
          },
          attachments: {
            type: "array",
            required: false,
            items: {
              type: "object",
              properties: {
                fileName: {
                  type: "string",
                  required: true
                },
                cid: {
                  type: "string",
                  required: false
                },
                contents: {
                  type: "string",
                  required: false
                },
                filePath: {
                  type: "string",
                  required: false
                },
                contentType: {
                  type: "string",
                  required: false
                }
              }
            }
          }
        }
      }
    }
  });

  /**
   * Schema: messages/message
   *
   * Represents a received or sent message.
   *
   * Inherits from <message.draft>.
   *
   * Requires the following properties to be set:
   *  - <message.draft.target>,
   *  - <message.draft.object.subject>,
   *  - <message.draft.object.text> and
   *  - <message.draft.object.date>
   */
  privateClient.declareType("message", {
    "extends": "draft" //,
    //required: ['target', 'object.subject', 'object.body', 'object.date']
  });

  var actorTemplate = {
    properties: {
      actor: {
        type: "object",
        required: true,
        properties: {
          name: { type: "string" },
          address: { type: "string" }
        }
      }
    }
  };

  /**
   * Schema: messages/xmpp-credentials
   *
   * Credentials for an XMPP connection.
   *
   * Properties:
   *   actor   - object:
   *     name    - The account owner's name.
   *               This name is used as the sender name for outgoing messages.
   *     address - The address associated with this account.
   *               Will be used as the sender address for outgoing messages.
   *   username - Username to authenticate against XMPP server.
   *   password - Password to authenticate against XMPP server.
   *   server     - Hostname of the XMPP server.
   *   resource - XMPP resource string (ie. Home)
   *   port     - Port to connect to.
   */
  privateClient.declareType("xmpp-credentials", {
    type: "object",
    properties: {
      actor: actorTemplate,
      credentials: {
        username: {
          type: "string",
          required: true
        },
        password: {
          type: "string",
          required: true
        },
        server: {
          type: "string",
          required: true
        },
        resource: {
          type: "string",
          required: true
        },
        port: {
          type: "number",
          required: false
        }
      }
    }
  });

  function unpackURI(uri) {
    var record = [];
    record = uri.split(":", 2);
    if (!record[1]) {
      return false;
    }

    try {
      record[1] = keyToAddress(record[1]);
    } catch (e) {
      console.log("unpackURI error: " + e);
      return false;
    }
    return record;
  }

  function packURI(type, address) {
    var uri = type + ":" + addressToKey(address);
    console.log("packURI: " + uri);
    return uri;
  }

  function addressToKey(address) {
    return address.replace(/@/g, "-at-");
  }

  function keyToAddress(key) {
    if (key === "current") {
      return;
    }

    try {
      var r = key.match(/^(.+?)\-at\-(.+)$/).slice(1).join("@");
      return r;
    } catch (e) {
      console.error("WARNING: failed to convert key to address: " + key);
    }
  }

  function sortAsc(a, b) {
    return a > b ? -1 : b > a ? 1 : 0;
  }
  function sortDesc(a, b) {
    return a < b ? -1 : b < a ? 1 : 0;
  }

  var dateIndexMethods = {
    byDate: function byDate(direction, limit) {
      console.log("byDate", arguments);
      var result = [];
      var sort = function sort(a) {
        return a ? a.sort("asc" ? sortAsc : sortDesc) : [];
      };
      var extractKeys = function extractKeys(obj) {
        return Object.keys(obj);
      };

      if (!limit) {
        throw "Limit not given";
      }

      // FIXME: all this can be greatly simplified by abstraction.

      var fetchYear = (function (years) {
        var year = years.shift();
        return this.getListing(year).then(extractKeys).then(sort).then(function (months) {
          return fetchMonth(year, months);
        }).then(function () {
          if (result.length < limit && years.length > 0) {
            return fetchYear(years);
          }
        });
      }).bind(this);

      var fetchMonth = (function (year, months) {
        var month = months.shift();
        return this.getListing(year + month).then(extractKeys).then(sort).then(function (days) {
          return fetchDay(year, month, days);
        }).then(function () {
          if (result.length < limit && months.length > 0) {
            return fetchMonth(year, months);
          }
        });
      }).bind(this);

      var fetchDay = (function (year, month, days) {
        var day = days.shift();
        return this.getListing(year + month + day).then(extractKeys).then(sort).then(function (messageIds) {
          return fetchMessage(year, month, day, messageIds);
        }).then(function () {
          if (result.length < limit && days.length > 0) {
            return fetchDay(year, month, days);
          }
        });
      }).bind(this);

      var fetchMessage = (function (year, month, day, messageIds) {
        var messageId = messageIds.shift();
        var path = year + month + day + messageId;
        return this.getObject(path).then(function (message) {
          if (message) {
            message.path = path;
            result.push(message);
          }
        }).then(function () {
          if (result.length < limit && messageIds.length > 0) {
            return fetchMessage(year, month, day, messageIds);
          }
        });
      }).bind(this);

      return this.getListing().then(extractKeys).then(sort).then(fetchYear).then(function () {
        return result;
      });
    },

    storeByDate: function storeByDate(type, date, id, object) {
      this._attachType(object, type);
      var result = this.validate(object);
      if (result.error) {
        console.log("validation result", result);
        throw result.error;
      }
      if (typeof date === "string") {
        date = new Date(Date.parse(date));
      } else if (typeof date === "number") {
        date = new Date(date);
      }
      var basePath = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()].join("/");
      var fileName = [date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()].join("-") + "-" + id;
      console.log("storing under", basePath + "/" + encodeURIComponent(fileName));
      return this.storeObject(type, basePath + "/" + encodeURIComponent(fileName), object);
    }
  };

  var messageCache = {};

  /**
   * Export: messages
   */

  /**
   * Public Method: account
   *
   * returns a <Messages> object.
   */
  var account = function account(accountURI) {
    if (messageCache[accountURI]) {
      return Promise.resolve(messageCache[accountURI]);
    }
    accountURI = addressToKey(accountURI);

    var messages = privateClient.scope("groups/" + accountURI + "/");
    messages.name = accountURI;
    messages.extend(messageMethods);
    messages.pool = messages.scope("pool/").extend(dateIndexMethods);
    messageCache[accountURI] = messages;
    return Promise.resolve(messages);
  };

  /**
   * Class: Messages
   *
   *   Represents a grouping of messages.
   *
   *
   * Property: name
   *   Name of the account the messages are attatched to
   *
   *
   * Property: pool
   *   Direct access to the message pool (a <DateIndexedScope>)
   */
  var messageMethods = {

    /**
     * Method: store
     *
     * Takes a <message> object and stores it.
     */
    store: function store(message) {
      return this.pool.storeByDate("message", message.object.date, message.object.messageId, message).then((function () {
        this.updateCounts(+1);
      }).bind(this));
    },

    updateCounts: function updateCounts(step) {
      return this.getFile("count").then((function (file) {
        return this.storeFile("text/plain", "count", String((parseInt(file.data) || 0) + step));
      }).bind(this));
    },

    getCount: function getCount() {
      return this.getFile("count").then(function (file) {
        return parseInt(file.data) || 0;
      });
    },

    /**
     *
     */
    list: function list(options) {
      if (!options) {
        options = {};
      }

      return this.pool.byDate(options.order || "desc", options.limit || 50);
    },

    unread: function unread() {
      return this.getObject("unread-index");
    }
  };

  return {

    exports: {

      credentials: privateClient.scope("credentials/").extend({

        list: function list(accountTypes) {

          if (typeof accountTypes === "string") {
            accountTypes = [accountTypes];
          }

          return this.getListing("").then(function (keys) {
            var listing = [];
            if (typeof keys === "object") {
              var keysArray = Object.keys(keys);
              var keysLength = keysArray.length;
              var numDone = 0;

              if (keysLength === 0) {
                return Promise.resolve(listing);
              } else {
                for (var key in keys) {
                  console.log("key", key);
                  var record = unpackURI(key);
                  if (record) {
                    if (!accountTypes) {
                      // all accounts match
                      listing.push(record);
                    } else {
                      // return listing of a specific account type
                      if (accountTypes.indexOf(record[1]) < 0) {
                        listing.push(record);
                      }
                    }
                  }
                  numDone++;
                  if (keysLength === numDone) {
                    return Promise.fulfill(listing);
                  }
                }
              }
            } else {
              return Promise.fulfill([]);
            }
          });
        },

        get: function get(accountType, address) {
          var uri;
          if (!address) {
            uri = addressToKey(accountType);
          } else {
            uri = packURI(accountType, address);
          }

          return this.getObject(uri);
        },

        save: function save(accountType, account) {
          var validTypes = ["xmpp"];

          if (!accountType) {
            return Promise.reject(["Can't save account without protocol accountType specified (first param)!"]);
          }

          if (typeof account.actor !== "object" || !account.actor.address) {
            return Promise.reject(["Can't save account without actor.address property!"]);
          }

          if (typeof account.credentials !== "object") {
            return Promise.reject(["Can't save account without a credentials property!"]);
          }

          if (validTypes.indexOf(accountType) < 0) {
            return Promise.reject(["Invalid type " + accountType]);
          }

          if (typeof account.credentials.port !== "number") {
            account.credentials.port = parseInt(account.credentials.port);
          }

          var uri = packURI(accountType, account.actor.address);

          return this.storeObject(accountType + "-credentials", uri, account);
        },

        remove: function remove(accountType, address) {
          var uri;
          if (!address) {
            uri = addressToKey(accountType);
          } else {
            uri = packURI(accountType, address);
          }
          return privateClient.remove("credentials/" + uri);
        }
      }),

      /**
       * Object: message.drafts
       */
      drafts: privateClient.scope("drafts/").extend({
        /**
         * Method: getLatest
         *
         * Get latest draft.
         */
        getLatest: function getLatest() {
          return this.getObject("latest");
        },

        /**
         * Method: saveLatest
         *
         * Save given draft as latest one.
         *
         * Parameters:
         *   draft - A <message.draft> Object
         */
        saveLatest: function saveLatest(draft) {
          return this.storeObject("draft", "latest", draft);
        },

        removeLatest: function removeLatest() {
          return this.remove("latest");
        }
      }),

      account: account,

      listMessageAccounts: function listMessageAccounts() {
        return privateClient.getListing("accounts/").then(function (obj) {
          return Object.keys(obj).map(function (item) {
            return item.replace(/\/$/, "");
          });
        });
      }
    }
  };
});

},{}]},{},[1]);

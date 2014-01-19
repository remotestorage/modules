/**
 * File: Messages
 *
 * Originally created by: - Niklas E. Cathor <nilclass@riseup.net>
 * Maintained by: - Nick Jennings <nick@silverbucket.net>
 *
 * Version:    - 0.1.0
 *
 * This module stores messages and drafts, as well as credentials for
 * all of the various messaging protocols.
 */

RemoteStorage.defineModule('messages', function (privateClient, publicClient) {

  /**
   * Using the mailbox index:
   *
   *
   *
   *   email.mailbox('inbox').store({
   *     date: ...
   *     subject: ...
   *     body: ...
   *     to: [
   *       {
   *         name: ...
   *         address: ...
   *       }
   *     ]
   *   });
   *   // will store at:
   *   //   /email/mailbox/inbox/pool/<year>/<month>/<day>/
   *   //     <hour>-<minute>-<second>-<message-id>
   *
   *   email.mailbox('inbox').list({
   *     limit: 50,
   *     order: 'desc'
   *   });
   *   // returns the 50 latest messages (this is also the defaults)
   *
   *   email.mailbox('sent').list({
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
   * Schema: message.draft
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
  privateClient.declareType('draft', {

    description: 'can be small (entry in the chat log) or big (email with CC\'s attachments)',
    properties: {
      'platform': {
        'type': 'string',
        'required': true
      },
      'actor': {
        'type': 'object',
        'properties': {
          'name': {
            'type': 'string',
            'required': false
          },
          'address': {
            'type': 'string',
            'required': true,
            'pattern': '^[a-zA-Z0-9]+'
          }
        }
      },
      'target': {
        'type': 'array',
        'required': true,
        'items': {
          'type': 'object',
          'properties': {
            'name': {
              'type': 'string',
              'required': false
            },
            'address': {
              'type': 'string',
              'required': false
            },
            'field': {
              'type': 'string',
              'description': 'cc, bcc, to, etc.',
              'required': false
            },
            'platform': {
              'type': 'string',
              'description': 'type of protocol used, xmpp, irc, email, etc.',
              'required': false
            }
          }
        }
      },
      'object': {
        'type': 'object',
        'required': true,
        'properties': {
          'headers': {
            'type': 'object',
            'required': false
          },
          'subject': {
            'type': 'string',
            'required': false
          },
          'text': {
            'type': 'string',
            'description': 'human-readable message',
            'required': false
          },
          'html': {
            'type': 'string',
            'description': 'html formatted message',
            'required': false
          },
          'timestamp': {
            'type': 'timestamp',
            'required': false
          },
          'date': {
            'type': 'date',
            'required': false
          },
          'encrypt': {
            'type': 'boolean',
            'default': false
          },
          'sign': {
            'type': 'boolean',
            'default': false
          },
          'attachments': {
            'type': 'array',
            'required': false,
            'items': {
              'type': 'object',
              'properties': {
                'fileName': {
                  'type': 'string',
                  'required': true
                },
                'cid': {
                  'type': 'string',
                  'required': false
                },
                'contents': {
                  'type': 'string',
                  'required': false
                },
                'filePath': {
                  'type': 'string',
                  'required': false
                },
                'contentType': {
                  'type': 'string',
                  'required': false
                }
              }
            }
          }
        }
      }
    }
  });


  /**
   * Schema: message
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
  privateClient.declareType('message', {
    extends: 'draft'//,
    //required: ['target', 'object.subject', 'object.body', 'object.date']
  });

  /**
   * Schema: account
   *
   * Represents an account's basic metadata.
   *
   * Properties:
   *   name    - The account owner's name.
   *             This name is used as the sender name for outgoing messages.
   *   address - The address associated with this account.
   *             Will be used as the sender address for outgoing messages.
   *
   */
  privateClient.declareType('account', {
    type: 'object',
    properties: {
      name: { type: 'string' },
      address: { type: 'string' }
    }
  });

  /**
   * Schema: account.smtp-credentials
   *
   * Credentials for a SMTP server.
   *
   * Properties:
   *   host     - Hostname of the SMTP server.
   *   username - Username to authenticate against SMTP server.
   *   password - Password to authenticate against SMTP server.
   *   port     - Port to connect to.
   *   secure   - Boolean flag to turn on TLS / SSL.
   */
  privateClient.declareType('smtp-credentials', {
    type: 'object',
    properties: {
      host: { type: 'string' },
      username: { type: 'string' },
      password: { type: 'string' },
      port: { type: 'number' },
      secure: { type: 'boolean' },
    }
  });

  /**
   * Schema: account.imap-credentials
   *
   * Credentials for an IMAP server.
   *
   * Properties:
   *   host     - Hostname of the IMAP server.
   *   username - Username to authenticate against IMAP server.
   *   password - Password to authenticate against IMAP server.
   *   port     - Port to connect to.
   *   secure   - Boolean flag to turn on TLS / SSL.
   */
  privateClient.declareType('imap-credentials', {
    type: 'object',
    properties: {
      host: { type: 'string' },
      username: { type: 'string' },
      password: { type: 'string' },
      port: { type: 'number' },
      secure: { type: 'boolean' },
    }
  });

  function addressToKey(address) {
    return address.replace(/@/g, '-at-') + '/';
  }

  function keyToAddress(key) {
    if (key === 'current') {
      return;
    }

    try {
      return key.match(/^(.+?)\-at\-(.+)\/$/).slice(1).join('@');
    } catch(e) {
      console.error('WARNING: failed to convert key to address: ' + key);
    }
  }

  function sortAsc(a, b) { return a > b ? -1 : b > a ? 1 : 0; }
  function sortDesc(a, b) { return a < b ? -1 : b < a ? 1 : 0; }

  var dateIndexMethods = {
    byDate: function (direction, limit) {
      console.log('byDate', arguments);
      var result = [];
      var sort = function (a) {
        return a ? a.sort('asc' ? sortAsc : sortDesc) : [];
      };

      if (! limit) {
        throw 'Limit not given';
      }

      // FIXME: all this can be greatly simplified by abstraction.

      var fetchYear = function (years) {
        var year = years.shift();
        return this.getListing(year).
          then(sort).
          then(function (months) {
            return fetchMonth(year, months);
          }).
          then(function () {
            if ((result.length < limit) && (years.length > 0)) {
              return fetchYear(years);
            }
          });
      }.bind(this);

      var fetchMonth = function (year, months) {
        var month = months.shift();
        return this.getListing(year + month).
          then(sort).
          then(function (days) {
            return fetchDay(year, month, days);
          }).
          then(function () {
            if ((result.length < limit) && (months.length > 0)) {
              return fetchMonth(year, months);
            }
          });
      }.bind(this);

      var fetchDay = function (year, month, days) {
        var day = days.shift();
        return this.getListing(year + month + day).
          then(sort).
          then(function (messageIds) {
            return fetchMessage(year, month, day, messageIds);
          }).
          then(function () {
            if ((result.length < limit) && (days.length > 0)) {
              return fetchDay(year, month, days);
            }
          });
      }.bind(this);

      var fetchMessage = function (year, month, day, messageIds) {
        var messageId = messageIds.shift();
        var path = year + month + day + messageId;
        return this.getObject(path).then(function (message) {
          if (message) {
            message.path = path;
            result.push(message);
          }
        }).then(function () {
          if ((result.length < limit) &&
              (messageIds.length > 0)) {
            return fetchMessage(year, month, day, messageIds);
          }
        });
      }.bind(this);

      return this.getListing().then(sort).then(fetchYear).
        then(function () {
          return result;
        });
    },

    storeByDate: function (type, date, id, object) {
      this._attachType(object, type);
      var result = this.validate(object);
      if (result.error) {
        console.log('validation result', result);
        throw result.error;
      }
      if (typeof date === 'string') {
        date = new Date(Date.parse(date));
      } else if (typeof date === 'number') {
        date = new Date(date);
      }
      var basePath = [
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate()
      ].join('/');
      var fileName = [
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      ].join('-') + '-' + id;
      console.log('storing under', basePath + '/' + encodeURIComponent(fileName));
      return this.storeObject(type, basePath + '/' + encodeURIComponent(fileName), object);
    }
  };

  var mailboxCache = {};

  /**
   * Export: mailbox
   */

  /**
   * Public Method: openMailbox
   *
   * returns a <Mailbox>.
   */
  var openMailbox = function (name) {
    if (mailboxCache[name]) {
      return mailboxCache[name];
    }

    var mailbox = privateClient.scope('mailbox/' + encodeURIComponent(name) + '/');
    mailbox.name = name;
    mailbox.extend(mailboxMethods);
    mailbox.pool = mailbox.scope('pool/').extend(dateIndexMethods);
    mailboxCache[name] = mailbox;
    return mailbox;
  };

  /**
   * Class: Mailbox
   *
   *   Represents a mailbox.
   *
   *
   * Property: name
   *   Name of the mailbox
   *
   *
   * Property: pool
   *   Direct access to the message pool (a <DateIndexedScope>)
   */

  var mailboxMethods = {

    /**
     * Method: store
     *
     * Takes a <email.message> object and stores it.
     */
    store: function (message) {
      return this.pool.storeByDate('message', message.date, message.messageId, message).
        then(function () {
          this.updateCounts( + 1 );
        }.bind(this));
    },

    storeAll: function (messages) {
      var n = messages.length, i = 0;
      var promise = promising();
      var errors = [];
      var oneDone = function () {
        console.log('saved ' + i + '/' + n + ' messages.');
        i++;
        if (i === n) {
          this.updateCounts( + n ).then(function () {
            promise.fulfill((errors.length > 0) ? errors : null);
          });
        }
      }.bind(this);
      var oneFailed = function (error) {
        console.log('failed', error);
        errors.push(error);
        oneDone();
      }.bind(this);
      messages.forEach(function (message) {
        this.pool.storeByDate('message', message.date, message.messageId, message).then(
          oneDone, oneFailed
        );
      }.bind(this));
      if (n === 0) promise.fulfill();
      return promise;
    },

    updateCounts: function (step) {
      return this.getFile('count').then(function (file) {
        return this.storeFile('text/plain', 'count', String((parseInt(file.data) || 0) + step));
      }.bind(this));
    },

    getCount: function () {
      return this.getFile('count').then(function (file) {
        return parseInt(file.data) || 0;
      });
    },

    /**
     *
     */
    list: function (options) {
      if (! options) {
        options = {};
      }

      return this.pool.byDate(
        options.order || 'desc',
        options.limit || 50
      );
    },

    unread: function () {
      return this.getObject('unread-index');
    }
  };

  return {
    exports: {
      credentials: privateClient.scope('credentials/').extend({
        getCurrent: function () {
          return this.getObject('current').then(function (account) {
            return (account && account.address) ?
              this.getAccount(account.address) : undefined;
          }.bind(this));
        },

        setCurrent: function (account) {
          return this.storeObject('account', 'current', account);
        },

        removeCurrent: function () {
          return this.remove('current');
        },

        listAccounts: function () {
          return this.getListing('').then(function (keys) {
            return keys ? keys.map(keyToAddress).filter(function (address) {
              return !! address;
            }) : [];
          });
        },

        getAccount: function (address) {
          var accountScope = this.scope(addressToKey(address));
          return accountScope.getListing('').then(function (keys) {
            // don't return empty accounts, but instead 'undefined'.
            if ((!keys) || (Object.keys(keys).length === 0)) {
              return undefined;
            } else {
              var promise = promising();
              var items = {};
              var n = keys.length, i = 0;
              function oneDone(key, value) {
                items[key] = value;
                i++;
                if(i === n) promise.fulfill(items);
              }
              keys.forEach(function (key) {
                accountScope.getObject(key).then(function (value) {
                  oneDone(key, value);
                }, function (error) {
                  console.error('failed to get account part \'' + key + '\': ', error, error.stack);
                  oneDone(key, undefined);
                });
              });
              return promise;
            }
          });
        },

        saveAccount: function (account) {
          var promise = promising();
          if (! account.actor.address) {
            promise.reject(["Can't save account without actor.address!"]);
            return promise;
          }
          var files = [];
          [['account', 'actor'],
           ['smtp-credentials', 'smtp'],
           ['imap-credentials', 'imap']
          ].forEach(function (fileDef) {
            var obj = account[fileDef[1]];
            if (obj) {
              if (obj.port) {
                obj.port = parseInt(obj.port);
              }
              files.push(fileDef.concat([obj]));
            }
          });
          var accountScope = this.scope(addressToKey(account.actor.address));
          var errors = [];
          var n = files.length, i = 0;
          function oneDone() {
            i++;
            if (i === n) {
              promise.fulfill((errors.length > 0) ? errors : null, account);
            }
          }
          function oneFailed(error) {
            errors.push(error);
            oneDone();
          }
          for (var j=0; j < n; j++) {
            accountScope.storeObject.apply(accountScope, files[j]).
              then(oneDone, oneFailed);
          }
          return promise;
        },

        removeAccount: function (address) {
          var accountScope = this.scope(addressToKey(address));
          return accountScope.getListing('').then(function (items) {
            var promise = promising();
            var n = items.length, i = 0;
            var errors = [];
            function oneDone() {
              i++;
              if (i === n) promise.fulfill(errors);
            }
            function oneFailed(error) {
              errors.push(error);
              oneDone();
            }
            items.forEach(function (item) {
              accountScope.remove(item).then(oneDone, oneFailed);
            });
          });
        }
      }),

      /**
       * Object: email.drafts
       */
      drafts: privateClient.scope('drafts/').extend({
        /**
         * Method: getLatest
         *
         * Get latest draft.
         */
        getLatest: function () {
          return this.getObject('latest');
        },

        /**
         * Method: saveLatest
         *
         * Save given draft as latest one.
         *
         * Parameters:
         *   draft - A <email.draft> Object
         */
        saveLatest: function (draft) {
          return this.storeObject('draft', 'latest', draft);
        },

        removeLatest: function () {
          return this.remove('latest');
        }
      }),

      openMailbox: openMailbox,

      listMailboxes: function () {
        return privateClient.getListing('mailbox/').then(function (list) {
          return (list||[]).map(function (item) {
            return item.replace(/\/$/, '');
          });
        });
      }
    }
  };
});
require('./test/dependencies');
require('./src/messages');

define([], function () {

  'use strict';

  var suites = [];

  // setup shared by all message suites
  function commonSetup(env) {
    remoteStorage.caching.enable('/');
    // email module
    env.messages = remoteStorage.messages;
    // message scope (to test if stuff was stored correctly)
    env.messageScope = remoteStorage.scope('/messages/');
  }

  /**
   ** DRAFTS SUITE
   **/

  suites.push({
    name: 'message.drafts',
    desc: 'message draft management',
    setup: function(env, test) {
      commonSetup(env);

      // fixtures
      env.validDraft = {
        actor: {
          address: 'foo@bar.baz'
        },
        target: [{
          address: 'bar@foo.baz'
        }],
        object: {
          body: 'hello world'
        }
      };

      env.invalidDraft = {
        // 'from' must be a valid email.recipient object
        actor: 'foo@bar.baz'
      };

      test.done();
    },

    tests: [
      {
        desc: '#drafts is a scope, with base \'drafts/\'',
        run: function (env, test) {
          test.assertTypeAnd(env.messages.drafts, 'object');
          test.assert(env.messages.drafts.base, '/messages/drafts/');
        }
      },

      {
        desc: '#drafts.saveLatest() stores a draft under \'drafts/latest\'',
        run: function (env, test) {
          env.messages.drafts.saveLatest(env.validDraft).then(function() {
            env.messageScope.getObject('drafts/latest').then(function(draft) {
              test.assert(draft, env.validDraft);
            });
          }, function (err) {
            console.log('saving draft failed with error', err);
            test.result(false, 'saving draft failed');
          });
        }
      },

      {
        desc: '#drafts.getLatest() gets the last saved draft',
        run: function (env, test) {
          env.messages.drafts.getLatest().then(function(draft) {
            test.assert(draft, env.validDraft);
          });
        }
      },

      {
        desc: '#drafts.saveLatest() refuses to save an invalid draft',
        run: function (env, test) {
          env.messages.drafts.saveLatest(env.invalidDraft).then(function() {
            test.result(false, 'draft was saved anyway');
          }, function (err) {
            test.done();
          });
        }
      },

      {
        desc: '#drafts.removeLatest() removes the latest draft',
        run: function (env, test) {
          env.messages.drafts.removeLatest().then(function() {
            env.messages.drafts.getLatest().then(function(draft) {
              test.assertType(draft, 'undefined');
            });
          });
        }
      }
    ]
  });

  suites.push({
    name: 'message groups',
    desc: 'listing and opening message groups',
    setup: function(env, test) {
      commonSetup(env);

      test.done();
    },

    tests: [

      {
        desc: '#listMessageAccounts() lists mailboxes',
        run: function(env, test) {
          env.messages.listMessageAccounts().then(function (list) {
            test.assert(list, []);
          });
        }
      },

      {
        desc: '#account() opens a message group',
        run: function(env, test) {
          env.messages.account('smtp:max-at-muster.de').then(function (accountMsgs) {
            test.assertType(accountMsgs, 'object');
          }, function (err) {
            test.fail(err);
          });
        }
      }

    ]
  });

  suites.push({
    name: 'Messages',
    desc: 'Representation of a message group',
    setup: function(env, test) {
      commonSetup(env);
      env.msgGroup = env.messages.account('imap:max-at-muster.de').then(function (accountMsgs) {
        env.msgGroup = accountMsgs;
        test.done();
      });
    },

    tests: [
      {
        desc: '#getCount() returns the initial count of 0',
        run: function (env, test) {
          env.msgGroup.getCount().then(function(count) {
            test.assert(count, 0);
          });
        }
      },

      {
        desc: '#store() stores a message by date',
        run: function (env, test) {
          var message = {
            actor: {
              address: 'max@muster.de'
            },
            target: [{
              address: 'maria@muster.de'
            }],
            object: {
              subject: 'something',
              body: 'also something',
              date: '2013-04-17 12:30:00 UTC',
              messageId: 'message-id',
            }
          };
          env.msgGroup.store(message).then(function() {
            return env.msgGroup.list();
          }).then(function (list) {
            test.assertAnd(list[0].object.subject, message.object.subject);
            env.messageScope.getObject(
              'groups/imap:max-at-muster.de/pool/2013/4/17/12-30-0-message-id'
            ).then(function (obj) {
              test.assert(obj, message);
            });
          });
        }
      },

      {
        desc: '#getCount() returns the count of 1 after storing a message',
        run: function(env, test) {
          env.msgGroup.getCount().then(function(count) {
            test.assert(count, 1);
          });
        }
      }
    ]
  });

  return suites;

});

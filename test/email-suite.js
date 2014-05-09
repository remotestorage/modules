require('./test/dependencies');

require('./src/utils/credentialsstore');
require('./src/utils/prefixtree');
require('./src/email');
define([], function() {

  var suites = [];

  // setup shared by all email suites
  function commonSetup(env) {
    remoteStorage.caching.enable('/');
    // email module
    env.email = remoteStorage.email;
    // email scope (to test if stuff was stored correctly)
    env.emailScope = remoteStorage.scope('/email/');
  }

  /**
   ** DRAFTS SUITE
   **/

  suites.push({
    name: 'email.drafts',
    desc: 'email draft management',
    setup: function(env, test) {
      commonSetup(env);

      // fixtures
      env.validDraft = {
        from: {
          address: 'foo@bar.baz'
        },
        to: [{
          address: 'bar@foo.baz'
        }],
        body: 'hello world'
      };

      env.invalidDraft = {
        // 'from' must be a valid email.recipient object
        from: 'foo@bar.baz'
      }

      test.done();
    },

    tests: [
      {
        desc: "#drafts is a scope, with base 'drafts/'",
        run: function(env, test) {
          test.assertTypeAnd(env.email.drafts, 'object');
          test.assert(env.email.drafts.base, '/email/drafts/');
        }
      },

      {
        desc: "#drafts.saveLatest() stores a draft under 'drafts/latest'",
        run: function(env, test) {
          env.email.drafts.saveLatest(env.validDraft).then(function() {
            env.emailScope.getObject('drafts/latest').then(function(draft) {
              test.assert(draft, env.validDraft);
            });
          }, function(err) {
            console.log("saving draft failed with error", err);
            test.result(false, "saving draft failed");
          });
        }
      },

      {
        desc: "#drafts.getLatest() gets the last saved draft",
        run: function(env, test) {
          env.email.drafts.getLatest().then(function(draft) {
            test.assert(draft, env.validDraft);
          });
        }
      },

      {
        desc: "#drafts.saveLatest() refuses to save an invalid draft",
        run: function(env, test) {
          env.email.drafts.saveLatest(env.invalidDraft).then(function() {
            test.result(false, "draft was saved anyway");
          }, function(err) {
            test.done();
          });
        }
      },

      {
        desc: "#drafts.removeLatest() removes the latest draft",
        run: function(env, test) {
          env.email.drafts.removeLatest().then(function() {
            env.email.drafts.getLatest().then(function(draft) {
              test.assertType(draft, 'undefined');
            });
          });
        }
      }
    ]
  });

  suites.push({
    name: "email.credentials",
    desc: "email accounts / credentials management",
    setup: function(env, test) {
      commonSetup(env);

      // fixtures
      env.fullAccount = {
        actor: {
          name: "Max Muster",
          address: "max@muster.de"
        },
        smtp: {
          host: "smtp.muster.de",
          port: 25,
          secure: true,
          username: "max",
          password: "unguessable"
        },
        imap: {
          host: "imap.muster.de",
          port: 993,
          secure: true,
          username: "max",
          password: "unguessable"
        }
      };

      test.done();
    },
    tests: [

      {
        desc: "#credentials is scoped to 'credentials/'",
        run: function(env, test) {
          test.assertTypeAnd(env.email.credentials, 'object');
          test.assert(env.email.credentials.base, '/email/credentials/');
        }
      },

      {
        desc: "#credentials.listAccounts() yields an array",
        run: function(env, test) {
          env.email.credentials.listAccounts().then(function(result) {
            test.assert(result, []);
          });
        }
      },

      {
        desc: "#credentials.saveAccount() saves the account data and credentials in separate files",
        run: function(env, test) {
          env.email.credentials.saveAccount(env.fullAccount).then(function() {
            env.emailScope.getObject(
              'credentials/max-at-muster.de/actor'
            ).then(function(actor) {
              test.assertAnd(actor, env.fullAccount.actor);
              env.emailScope.getObject(
                'credentials/max-at-muster.de/imap'
              ).then(function(imap) {
                test.assertAnd(imap, env.fullAccount.imap);
                env.emailScope.getObject(
                  'credentials/max-at-muster.de/smtp'
                ).then(function(smtp) {
                  test.assert(smtp, env.fullAccount.smtp);
                });
              });
            });
          });
        }
      },

      {
        desc: "#credentials.getAccount() loads all the parts of the account",
        run: function(env, test) {
          env.email.credentials.getAccount('max@muster.de').then(function(account) {
            test.assert(account, env.fullAccount);
          });
        }
      },

      {
        desc: "#credentials.getAccount() yields 'undefined' for accounts that don't exist",
        run: function(env, test) {
          env.email.credentials.getAccount('doesnt@exist').then(function(account) {
            test.assertType(account, 'undefined');
          });
        }
      },

      {
        desc: "#credentials.listAccounts() contains all the addresses of defined accounts",
        run: function(env, test) {
          env.email.credentials.listAccounts().then(function(list) {
            test.assert(list, ['max@muster.de']);
          });
        }
      },

      {
        desc: "#credentials.getCurrent() yields 'undefined' if there is no account set as current",
        run: function(env, test) {
          env.email.credentials.getCurrent().then(function(actor) {
            test.assertType(actor, 'undefined');
          });
        }
      },

      {
        desc: "#credentials.setCurrent() stores an actor as current account",
        run: function(env, test) {
          env.email.credentials.setCurrent(env.fullAccount.actor).then(function() {
            env.emailScope.getObject('credentials/current').then(function(result) {
              test.assert(result, env.fullAccount.actor);
            });
          });
        }
      },

      {
        desc: "#credentials.getCurrent() retrieves the entire current account",
        run: function(env, test) {
          env.email.credentials.getCurrent().then(function(acct) {
            test.assert(env.fullAccount, acct);
          });
        }
      },

      {
        desc: "#credentials.removeCurrent() removes the pointer to the current account, but not the account itself",
        run: function(env, test) {
          env.email.credentials.removeCurrent().then(function() {
            env.email.credentials.getCurrent().then(function(current) {
              test.assertTypeAnd(current, 'undefined');
              env.email.credentials.getAccount('max@muster.de').then(function(acct) {
                test.assertType(acct, 'object');
              });
            });
          });
        }
      },

      {
        desc: "#credentials.removeAccount() removes an entire account",
        run: function(env, test) {
          env.email.credentials.removeAccount('max@muster.de').then(function() {
            env.emailScope.getListing('credentials/max-at-muster.de/').
              then(function(list) {
                test.assertType(list, 'undefined');
              });
          });
        }
      }

    ]
  });

  suites.push({
    name: "email mailbox",
    desc: "listing and opening mailboxes",
    setup: function(env, test) {
      commonSetup(env);

      test.done();
    },

    tests: [

      {
        desc: "#listMailboxes() lists mailboxes",
        run: function(env, test) {
          env.email.listMailboxes().then(function(list) {
            test.assert(list, [])
          });
        }
      },

      {
        desc: "#openMailbox() opens a mailbox",
        run: function(env, test) {
          var inbox = env.email.openMailbox('INBOX');
          test.assertType(inbox, 'object');
        }
      }

    ]
  });

  suites.push({
    name: "Mailbox",
    desc: "Representation of a Mailbox",
    setup: function(env, test) {
      commonSetup(env);

      env.mailbox = env.email.openMailbox('INBOX');

      test.done();
    },

    tests: [
      {
        desc: "#getCount() returns the initial count of 0",
        run: function(env, test) {
          env.mailbox.getCount().then(function(count) {
            test.assert(count, 0);
          });
        }
      },

      {
        desc: "#store() stores a message by date",
        run: function(env, test) {
          var message = {
            from: {
              address: 'max@muster.de'
            },
            to: [{
              address: 'maria@muster.de'
            }],
            subject: 'something',
            body: 'also something',
            date: '2013-04-17 12:30:00 UTC',
            messageId: 'message-id',
          };
          env.mailbox.store(message).then(function() {
            env.emailScope.getObject(
              'mailbox/INBOX/pool/2013/4/17/12-30-0-message-id'
            ).then(function(obj) {
              test.assert(obj, message);
            });
          });
        }
      },

      {
        desc: "#getCount() returns the count of 1 after storing a message",
        run: function(env, test) {
          env.mailbox.getCount().then(function(count) {
            test.assert(count, 1);
          });
        }
      }
    ]
  });

  return suites;

});

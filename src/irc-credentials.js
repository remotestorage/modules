/**
 * File: IRC Credentials
 *
 * Maintainer: Nick Jennings <nick@silverbucket.net>
 * Version: -    0.2.0
 *
 */
RemoteStorage.defineModule('irc-credentials', function(privClient, pubClient) {
  if(!CredentialsStore) {
    throw new Error('please include utils/credentialsstore.js');
  }
  /**
   * Schema: irc/credentials
   *
   * Credentials for IRC
   *
   *   nick     - IRC nick (string)
   *   password - password (string)
   *   server   - the xmpp server to connect to (string)
   */
  privClient.declareType('credentials', {
    type: 'object',
    description: 'IRC credentials file',
    required: ['nick', 'server'],
    additionalProperties: false,
    properties: {
      uri: {
        type: 'string',
        description: 'unique identifier complete with URI prefix. ie. irc:username@irc.freenode.net'
      },
      nick: {
        type: 'string'
      },
      password: {
        type: 'string'
      },
      server: {
        type: 'uri'
      }
    },
  });

  return {
    exports: new CredentialsStore('irc-credntials', privClient)
  };
});

/**
 * File: Messages (IRC)
 *
 * Maintainer:      - Sebastian Kippe <sebastian@kip.pe>
 * Version:         - 0.1.0
 *
 * This module stores IRC messages in daily archive files.
 */

RemoteStorage.defineModule('messages-irc', function (client, publicClient) {

  const extend = RemoteStorage.util.extend;

  //
  // Message object schema
  // TODO move to central place, re-use for other messages modules
  //

  let messageObject  = {
    "date": {
      "type": "string",
      "format": "date-time"
    },
    "user": {
      "type": "string"
    },
    "text": {
      "type": "string",
    },
  };

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
   *   "@id": "messages/irc/freenode/kosmos/",
   *   "@type": "ChatChannel",
   *   "name": "#kosmos",
   *   "ircURI": "irc://irc.freenode.net/#kosmos",
   *   "today":  {
   *     "@id": "2015/01/01",
   *     "@type": "ChatLog",
   *     "messageType": "InstantMessage",
   *     "previous": "2014/12/31",
   *     "next": "2015/01/02",
   *     "messages": [
   *       { "date": "2015-06-05T17:35:28.454Z", "user": "hal8000", "text": "knock knock" },
   *       { "date": "2015-06-05T17:37:42.123Z", "user": "raucao", "text": "who's there?" },
   *       { "date": "2015-06-05T17:55:01.235Z", "user": "hal8000", "text": "HAL" },
   *     ]
   *   }
   * }
   * (end code)
   */


  const ircMessages = {

  };

  // Return public functions
  return { exports: ircMessages };

});

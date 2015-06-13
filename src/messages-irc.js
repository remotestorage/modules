/**
 * File: Messages (IRC)
 *
 * Maintainer:      - Sebastian Kippe <sebastian@kip.pe>
 * Version:         - 0.1.0
 *
 * This module stores IRC messages in daily archive files.
 */

RemoteStorage.defineModule('messages-irc', function (client, publicClient) {

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
   *       { "date": "2015-06-05T17:55:01.235Z", "user": "hal8000", "text": "HAL" }
   *     ]
   *   }
   * }
   * (end code)
   */

  privateClient.declareType('daily', {
    "type": "object",
    "properties": {
      "@context": {
        "type": "string",
        "default": "https://kosmos.org/ns/v1",
        "enum": [ "https://kosmos.org/ns/v1" ]
      },
      "@id": {
        "type": "string",
        "default": "messages/irc/freenode/kosmos/",
        "enum": [ "messages/irc/freenode/kosmos/" ],
      },
      "@type": {
        "type": "string",
        "default": "ChatChannel",
        "enum": [ "ChatChannel" ],
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
            "pattern": "\d{4}\/\d{2}\/\d{2}"
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
            "pattern": "\d{4}\/\d{2}\/\d{2}"
          },
          "next": {
            "type": "string",
            "pattern": "\d{4}\/\d{2}\/\d{2}"
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
                  "type": "string",
                }
              }
            }
          }
        }
      }
    },
    "required": []
  });

  const ircMessages = {

  };

  // Return public functions
  return { exports: ircMessages };

});

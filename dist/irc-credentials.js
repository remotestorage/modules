(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * File: IRC Credentials
 *
 * Maintainer: - Nick Jennings <nick@silverbucket.net>
 * Version:    - 0.2.0
 *
 */
"use strict";

RemoteStorage.defineModule("irc-credentials", function (privClient, pubClient) {
  privClient.cache("", "ALL");

  if (!CredentialsStore) {
    throw new Error("please include utils/credentialsstore.js");
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
  privClient.declareType("credentials", {
    type: "object",
    description: "IRC credentials file",
    required: ["nick", "server"],
    additionalProperties: false,
    properties: {
      uri: {
        type: "string",
        description: "unique identifier complete with URI prefix. ie. irc:username@irc.freenode.net"
      },
      nick: {
        type: "string"
      },
      password: {
        type: "string"
      },
      server: {
        type: "string",
        format: "uri"
      },
      "@context": {
        type: "string"
      }
    } });

  var credentialsStore = new CredentialsStore("irc-credentials", privClient);

  function onceRooms(handler) {
    privClient.on("change", function (evt) {
      if (evt.relativePath === "rooms") {
        handler(evt.newValue);
      }
    });
    privClient.getFile("rooms").then(function (obj) {
      handler(obj.data);
    });
  }
  function setRooms(obj) {
    privClient.storeFile("application/json", "rooms", JSON.stringify(obj));
  }

  return {
    exports: {
      getConfig: credentialsStore.getConfig.bind(credentialsStore),
      setConfig: credentialsStore.setConfig.bind(credentialsStore),
      onceConfig: credentialsStore.onceConfig.bind(credentialsStore),
      on: credentialsStore.on.bind(credentialsStore),
      setRooms: setRooms,
      onceRooms: onceRooms
    }
  };
});

},{}]},{},[1]);

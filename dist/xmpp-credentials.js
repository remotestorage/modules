(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * File: XMPP Credentials
 *
 * Maintainer: - Nick Jennings <nick@silverbucket.net>
 * Version:    - 0.2.0
 *
 */
"use strict";

RemoteStorage.defineModule("xmpp-credentials", function (privClient, pubClient) {
  if (!CredentialsStore) {
    throw new Error("please include utils/credentialsstore.js");
  }
  /**
   * Schema: xmpp/credentials
   *
   * Credentials for XMPP
   *
   *   username - username (string)
   *   password - password (string)
   *   server   - the xmpp server to connect to (string)
   *   resource - the resource name (string)
   *   port     - the port to connect to (number)
   */
  privClient.declareType("credentials", {
    type: "object",
    description: "XMPP credentials file",
    required: ["username", "password", "server", "resource"],
    additionalProperties: false,
    properties: {
      uri: {
        type: "string",
        description: "unique identifier complete with URI prefix. ie. xmpp:username@host.org"
      },
      username: {
        type: "string"
      },
      password: {
        type: "string"
      },
      server: {
        type: "uri"
      },
      resource: {
        type: "string"
      },
      port: {
        type: "number"
      }
    }
  });

  return {
    exports: new CredentialsStore("xmpp-credentials", privClient)
  };
});

},{}]},{},[1]);

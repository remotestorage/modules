(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/basti/src/remotestorage/modules/src/twitter-credentials.js":[function(require,module,exports){
/**
 * File: Twitter
 *
 * Maintainer: Michiel de Jong <michiel@unhosted.org>
 * Version: -    0.1.0
 *
 */
"use strict";

RemoteStorage.defineModule("twitter", function (privClient, pubClient) {
  if (!CredentialsStore) {
    throw new Error("please include utils/credentialsstore.js");
  }
  /**
   * Schema: twitter/config
   *
   * Credentials configuration for Twitter
   *
   * actor - object:
   *   name - not used (must be a string)
   *   address - not used (must be a string)
   * object - object:
   *   objectType - always 'credentials'
   *   consumer_key - your API key for the Twitter API (string)
   *   consumer_secret - your API secret for the Twitter API (string)
   *   access_token - your access token for the Twitter API (string)
   *   access_token_secret - your access token secret for the Twitter API (string)
   */
  privClient.declareType("config", {
    type: "object",
    properties: {
      actor: {
        type: "object",
        properties: {
          name: { type: "string" },
          address: { type: "string" } },
        required: ["name", "address"]
      },
      object: {
        type: "object",
        properties: {
          objectType: { type: "string", "enum": ["credentials"] },
          consumer_key: { type: "string" }, // aka API key
          consumer_secret: { type: "string" }, // aka API secret
          access_token: { type: "string" },
          access_token_secret: { type: "string" }
        },
        required: ["objectType", "access_token", "access_token_secret", "consumer_secret", "consumer_key"]
      }
    },
    required: ["actor", "object"]
  });
  return {
    exports: new CredentialsStore("twitter", privClient)
  };
});

},{}]},{},["/home/basti/src/remotestorage/modules/src/twitter-credentials.js"]);

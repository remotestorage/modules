(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/basti/src/remotestorage/modules/src/facebook-credentials.js":[function(require,module,exports){
/**
 * File: Facebook
 *
 * Maintainer: - Michiel de Jong <michiel@unhosted.org>
 * Version:    - 0.1.0
 *
 */
"use strict";

RemoteStorage.defineModule("facebook", function (privClient, pubClient) {
  if (!CredentialsStore) {
    throw new Error("please include utils/credentialsstore.js");
  }
  /**
   * Schema: facebook/config
   *
   * Credentials configuration for Facebook
   *
   * actor - object:
   *   name - not used (must be a string)
   *   address - not used (must be a string)
   * object - object:
   *   objectType - always 'credentials'
   *   access_token - your (short- or long-lived) access token for the Facebook API (string)
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
          access_token: { type: "string" }
        },
        required: ["objectType", "access_token"]
      }
    },
    required: ["actor", "object"]
  });
  return {
    exports: new CredentialsStore("facebook", privClient)
  };
});

},{}]},{},["/home/basti/src/remotestorage/modules/src/facebook-credentials.js"]);

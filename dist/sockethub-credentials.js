(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/basti/src/remotestorage/modules/src/sockethub-credentials.js":[function(require,module,exports){
/**
 * File: Sockethub Credentials
 *
 * Maintainer: Nick Jennings <nick@silverbucket.net>
 * Version: -    0.2.0
 *
 */
"use strict";

RemoteStorage.defineModule("sockethub-credentials", function (privateClient, publicClient) {
  privateClient.cache("", "ALL");

  if (!CredentialsStore) {
    throw new Error("please include utils/credentialsstore.js");
  }

  privateClient.declareType("credentials", {
    type: "object",
    description: "sockethub credentials file",
    required: ["host", "port", "secret"],
    additionalProperties: false,
    properties: {
      host: {
        type: "string",
        description: "the hostname to connect to",
        format: "uri"
      },
      port: {
        type: "number",
        description: "the port number to connect to"
      },
      path: {
        type: "string",
        description: "path portion of the URI, if any"
      },
      tls: {
        type: "boolean",
        description: "whether or not to use TLS"
      },
      secret: {
        type: "string",
        description: "the secret to identify yourself with the sockethub server"
      },
      "@context": {
        type: "string"
      }
    }
  });

  return {
    exports: new CredentialsStore("sockethub-credentials", privateClient)
  };
});

},{}]},{},["/home/basti/src/remotestorage/modules/src/sockethub-credentials.js"]);

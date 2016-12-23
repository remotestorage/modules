(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * File: www
 *
 * Maintainer: - Michiel de Jong <michiel@unhosted.org>
 * Version:    - 0.1.0
 *
 * FIXME add description
 *
 */
"use strict";

RemoteStorage.defineModule("www", function (privClient, pubClient) {
  var MIN_WEB_AUTHORING_PORT = 1024;
  var MAX_WEB_AUTHORING_PORT = 65535;
  var authoringPorts = {};

  return {
    exports: {
      init: function init() {
        pubClient.getListing("").then(function (listing) {
          console.log("existing apps", listing);
        });
        pubClient.on("change", function (evt) {
          var ports = evt.relativePath.split("/");
          console.log("change in app on port", ports[0]);
          authoringPorts[ports[0]] = true;
        });
      },
      authoringSupported: function authoringSupported() {
        return remoteStorage && remoteStorage.remote && typeof remoteStorage.remote.properties === "object" && typeof remoteStorage.remote.properties["http://remotestorage.io/spec/web-authoring"] === "string";
      },
      storeFile: function storeFile(authoringPort, contentType, path, body) {
        return pubClient.storeFile(contentType, authoringPort + "/" + path, body);
      },
      getWebUrl: function getWebUrl(authoringPort, path) {
        var protocol;
        //on localhost, the protocol is http instead of https:
        if (remoteStorage.remote.properties["http://remotestorage.io/spec/web-authoring"] === "localhost") {
          protocol = "http";
        } else {
          protocol = "https";
        }
        return protocol + "://" + remoteStorage.remote.properties["http://remotestorage.io/spec/web-authoring"] + ":" + authoringPort + "/" + path;
      },
      addAuthoringPort: function addAuthoringPort() {
        for (var i = MIN_WEB_AUTHORING_PORT; i <= MAX_WEB_AUTHORING_PORT; i++) {
          if (!authoringPorts[i.toString()]) {
            console.log("port stil free", i);
            return i;
          }
        }
        throw new Error("no web authoring ports left!");
      }
    }
  };
});

},{}]},{},[1]);

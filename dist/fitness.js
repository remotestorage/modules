(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * File: Fitness
 *
 * Nick Jennings <nick@silverbucket.net>
 *
 * Version:    - 0.0.4
 *
 * This module stores fitness related data, such as body measurements,
 * excersize activity, etc.
 *
 */

"use strict";

RemoteStorage.defineModule("fitness", function (privateClient, publicClient) {

  var extend = remoteStorage.util.extend;

  // body measurement
  var bodyMeasurementProperties = {
    id: {
      type: "string",
      description: "ID is created during creation of record (and is a timestamp)"
    },
    weight: {
      type: "number",
      description: "current weight of person in ounces" },
    height: {
      type: "number",
      description: "current height of the person in centimeters"
    },
    chestSize: {
      type: "number",
      description: "current circumference of chest (cm)"
    },
    bicepsSize: {
      type: "number",
      description: "current circumference of biceps (cm)"
    },
    stomachSize: {
      type: "number",
      description: "current circumference of belly (cm)"
    },
    waistSize: {
      type: "number",
      description: "current circumference of waist (cm)"
    },
    hipSize: {
      type: "number",
      description: "current circumference of hips (cm)"
    },
    thighSize: {
      type: "number",
      description: "current circumference of thighs (cm)"
    },
    bodyFatPercentage: {
      type: "number",
      description: "current body fat percentage"
    },
    clothing: {
      type: "object",
      properties: {
        pantSize: {
          type: "number",
          description: "current pant waist size"
        },
        dressSize: {
          type: "number",
          description: "current dress size"
        }
      }
    },
    createdAt: {
      type: "number",
      description: "date measurements were created"
    },
    updatedAt: {
      type: "number",
      description: "date measurements were updated"
    },
    "@context": {
      type: "string",
      format: "uri"
    }
  };

  privateClient.declareType("body-measurement", {
    key: "id",
    type: "object",
    required: ["id", "createdAt", "updatedAt", "@context"],
    additionalProperties: false,
    properties: bodyMeasurementProperties
  });

  var generateBaseMethods = function generateBaseMethods(type) {

    var scopedClient = privateClient.scope(type + "/");

    return {

      on: scopedClient.on.bind(scopedClient),

      /**
       * Function: remove
       *
       * Remove the record, as specified by ID.
       *
       * Parameters:
       *
       *   id - ID of record to remove
       *
       * Returns:
       *
       *   return a promise which is resolved upon successful deletion of record.
       */
      remove: function remove(id) {
        if (typeof id !== "string") {
          return Promise.reject("Required param 'id' not specified.");
        }
        return scopedClient.remove(id);
      },

      /**
       * Function: create
       *
       * Add a new record.
       *
       * Parameters:
       *
       *   obj  - the JSON object to use
       *
       * Returns:
       *
       *   return a promise which is resolved with the saved object upon completion
       *          (with fields `id` and `date_created` etc.)
       */
      create: function create(obj) {
        var timestamp = new Date().getTime();
        obj.createdAt = timestamp;
        obj.updatedAt = timestamp;
        obj.id = "" + timestamp; // filenames must be strings

        return scopedClient.storeObject(type, obj.id, obj).then(function () {
          return obj;
        });
      },

      /**
       * Function: update
       *
       * Update an existing record.
       *
       * Parameters:
       *
       *   obj  - the JSON object to use (must contain existing ID)
       *
       * Returns:
       *
       *   return a promise which is resolved with the updated object upon completion
       *
       */
      update: function update(obj) {
        if (!obj.id) {
          return Promise.reject("Object has no 'id' property, cannot update.");
        }
        obj.updatedAt = new Date().getTime();

        return scopedClient.storeObject(type, obj.id, obj).then(function () {
          return obj;
        });
      },

      /**
       * Function: get
       *
       * Get a record by ID
       *
       * Parameters:
       *
       *   id - ID of record to fetch.
       *
       * Returns:
       *
       *   return a promise which is resolved with the desired object if it exists.
       */
      get: function get(id) {
        if (typeof id !== "string") {
          return Promise.reject("Required param 'id' not specified.");
        }
        return scopedClient.getObject(id);
      },

      getAll: scopedClient.getAll.bind(scopedClient),

      getListing: scopedClient.getListing.bind(scopedClient)

    };
  };

  return {

    exports: {

      bodyMeasurement: generateBaseMethods("body-measurement")

    }

  };
});

},{}]},{},[1]);

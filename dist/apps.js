(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/basti/src/remotestorage/modules/src/apps.js":[function(require,module,exports){
/**
 * File: Apps
 *
 * Maintainer: Michiel de Jong <michiel@unhosted.org>
 * Version: -    0.1.0
 *
 */
"use strict";

RemoteStorage.defineModule("apps", function (privClient, pubClient) {
  var apps = {},
      defaultApps = {},
      channelUrl,
      currentChannel;

  var channelChangeHandler = function channelChangeHandler() {
    console.log("Please call remoteStorage.apps.onChannelChange(handler)");
  };

  var appsChangeHandler = function appsChangeHandler() {
    console.log("Please call remoteStorage.apps.onAppsChange(handler)");
  };

  function fetchManifest(manifestUrl) {
    var pending = Promise.defer(),
        xhr = new XMLHttpRequest();
    xhr.open("GET", manifestUrl, true);
    //xhr.responseType = 'json';
    xhr.onload = function () {
      var obj;
      try {
        obj = JSON.parse(xhr.response);
      } catch (e) {
        pending.reject("could not parse JSON document from " + manifestUrl);
        return;
      }
      pending.resolve(obj);
    };
    xhr.onerror = function () {
      pending.reject("could not fetch " + manifestUrl);
    };
    xhr.send();
    return pending.promise;
  }

  function fillInBlanks(key, obj) {
    var pending;
    if (obj.manifest) {
      return fetchManifest(obj.manifest);
    }
    pending = Promise.defer();
    obj.href = obj.href || "https://" + key.toLowerCase() + ".5apps.com/";
    obj.img = obj.img || "/img/" + key.toLowerCase() + ".png";
    obj.name = obj.name || key;
    pending.resolve(obj);
    return pending.promise;
  }

  function setAppChannel(channelUrl) {
    return privClient.storeFile("plain/txt", "channel-url", channelUrl).then(function () {
      return fetchDefaultApps();
    });
  }
  var time = 0;
  function fetchDefaultApps() {
    var thisTime = time++;
    return privClient.getFile("channel-url").then(function (obj) {
      var pending = Promise.defer();
      var channelUrl = obj.data;
      if (typeof channelUrl !== "string") {
        channelUrl = "https://apps.unhosted.org/defaultApps.json";
        setAppChannel(channelUrl);
      }
      if (currentChannel === channelUrl) {
        pending.resolve();
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.open("GET", channelUrl, true);
      xhr.responseType = "json";
      xhr.onerror = function () {
        pending.reject("error fetching app list");
      };
      xhr.onload = function () {
        var numRunning = 0;
        if (xhr.response === null) {
          pending.reject("not json");
          return;
        }
        defaultApps = {};
        for (var i in xhr.response) {
          numRunning++;
          fillInBlanks(i, xhr.response[i]).then((function (bindI) {
            return function (obj) {
              defaultApps[bindI] = obj;
              numRunning--;
              if (numRunning === 0) {
                pending.resolve();
              }
            };
          })(i), function () {
            numRunning--;
            if (numRunning === 0) {
              pending.resolve();
            }
          });
        }
        currentChannel = channelUrl;
        if (numRunning === 0) {
          pending.resolve();
        }
      };
      xhr.send();
      return pending.promise;
    });
  }

  /**
   * Function: remoteStorage.apps.installApp
   *
   * Add an app to the user's list of installed apps. Will trigger
   * the change handler to be called if you previously set one using
   * `remoteStorage.apps.onChange(handler);`.
   *
   * Parameters:
   *   name - name of the app (key in the defaultApps dictionary)
   */
  function installApp(name) {
    apps[name] = defaultApps[name];
    return privClient.storeObject("app", name, apps[name]);
  }

  /**
   * Function: remoteStorage.apps.uninstallApp
   *
   * Remove an app to the user's list of installed apps. Will trigger
   * the change handler to be called if you previously set one using
   * `remoteStorage.apps.onChange(handler);`.
   *
   * Parameters:
   *   name - name of the app (key in the defaultApps dictionary)
   */
  function uninstallApp(name) {
    delete apps[name];
    privClient.remove(name);
  }

  /**
   * Function: remoteStorage.apps.onChannelChange
   *
   * Set the change event handler. This will be called, with the
   * app channel URL as the only argument, on page load and then
   * whenever it changes. Example:
   *
   * remoteStorage.apps.onChannelChange(function(url) {
   *   myChannelUrlInput.value = url;
   * });
   *
   * Parameters:
   *   handler - a Function that takes a dictionary of apps as its only argument
   */
  function onChannelChange(handler) {
    channelChangeHandler = handler;
  }

  /**
   * Function: remoteStorage.apps.onAppsChange
   *
   * Set the change event handler. This will be called, with the
   * dictionary of installed apps as the only argument, once on page load,
   * and then whenever the list of installed apps changes. Example:
   *
   * remoteStorage.apps.onChange(function(apps) {
   *   myAppsView.reset();
   *   for (var i in apps) {
   *     myAppsView.add(apps[i]);
   *   }
   *   myAppsView.render();
   * });
   *
   * Parameters:
   *   handler - a Function that takes a dictionary of apps as its only argument
   */
  function onAppsChange(handler) {
    appsChangeHandler = handler;
  }

  function init() {
    RemoteStorage.config.changeEvents.window = true;
    privClient.cache("", "ALL");
    privClient.on("change", function (evt) {
      if (evt.newValue !== evt.oldValue) {
        //this is a workaround for https://github.com/remotestorage/remotestorage.js/issues/764
        if (evt.relativePath === "channel-url") {
          channelChangeHandler(evt.newValue);
        } else {
          if (evt.newValue) {
            apps[evt.relativePath] = evt.newValue;
          } else {
            delete apps[evt.relativePath];
          }
        }
      }
      appsChangeHandler(apps);
    });

    /**
     * Schema: apps/app
     *
     * Info necessary for displaying a link to an app in an app store
     *
     * name - the name of the app that's being described here (string)
     * href - launch URL (string)
     * img - URL of a 128x128px app icon (string)
     */
    privClient.declareType("app", {
      type: "object",
      properties: {
        name: { type: "string" },
        href: { type: "string" },
        img: { type: "string" }
      },
      required: ["name"]
    });
  }

  function getAsset(appName, assetBase, assetPath, authoringPort) {
    var pending = Promise.defer();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", assetBase + assetPath, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      remoteStorage.www.storeFile(authoringPort, xhr.getResponseHeader("Content-Type"), assetPath, xhr.response).then(function () {
        pending.resolve();
      }, function () {
        pending.reject();
      });
    };
    xhr.onerror = function () {
      pending.reject();
    };
    xhr.send();
    return pending.promise;
  }

  function cloneApp(name) {
    var pending = Promise.defer(),
        numDone = 0,
        i;
    if (Array.isArray(apps[name].assets) && apps[name].assets.length >= 1) {
      var authoringPort = remoteStorage.www.addAuthoringPort();
      for (i = 0; i < apps[name].assets.length; i++) {
        getAsset(name, apps[name].href, apps[name].assets[i], authoringPort).then(function () {
          numDone++;
          if (numDone === apps[name].assets.length) {
            apps[name].href = remoteStorage.www.getWebUrl(authoringPort, "");
            apps[name].cloned = true;
            privClient.storeObject("app", name, apps[name]).then(function () {
              pending.resolve();
            });
          }
        }, function () {
          pending.reject("error retrieving one of the assets");
        });
      }
    } else {
      pending.reject("could not determine assets of " + name);
    }
    return pending.promise;
  }

  /**
   * Function: remoteStorage.apps.getInstalledApps
   *
   * Get a dictionary of apps whihch the user has installed.
   *
   * Parameters:
   *   (none)
   *
   * Returns: A dictionary from string app names to objects that follow the
   *              apps/app schema defined above.
   */
  function getInstalledApps() {
    return apps;
  }

  /**
   * Function: remoteStorage.apps.getAvailableApps
   *
   * Get a dictionary of apps whihch the user does not have installed, but
   * which are available to install.
   *
   * Parameters:
   *   cloneableOnly - boolean; if set to true, only returns apps whose assets
   *                       you can clone to your own storage.
   *
   * Returns: A dictionary from string app names to objects that follow the
   *              apps/app schema defined above.
   */
  function getAvailableApps(cloneableOnly) {
    return fetchDefaultApps().then(function () {
      var i,
          availableApps = {};
      for (i in defaultApps) {
        if (!apps[i] && (Array.isArray(defaultApps[i].assets) || !cloneableOnly)) {
          availableApps[i] = defaultApps[i];
        }
      }
      return availableApps;
    });
  }

  //...
  init();

  return {
    exports: {
      onChannelChange: onChannelChange,
      onAppsChange: onAppsChange,
      setAppChannel: setAppChannel,
      installApp: installApp,
      uninstallApp: uninstallApp,
      getInstalledApps: getInstalledApps,
      getAvailableApps: getAvailableApps,
      cloneApp: cloneApp
    }
  };
});

},{}]},{},["/home/basti/src/remotestorage/modules/src/apps.js"]);

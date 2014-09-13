/**
 * File: Apps
 *
 * Maintainer: Michiel de Jong <michiel@unhosted.org>
 * Version: -    0.1.0
 *
 */
RemoteStorage.defineModule('apps', function(privClient, pubClient) {
  var apps = {},
    defaultApps = {
      litewrite: {
        href: 'http://litewrite.net', // <-- optional; defaults to https://name.5apps.com/ (lowercased)
        img: '/img/litewrite.png', // <-- optional; defaults to /img/name.png (lowercased)
        name: 'litewrite' // <-- optional; defaults to name
      },
      Laverna: { href: 'https://laverna.cc/' },
      mcnotes: { },
      //(no rs) StackEdit: { href: 'https://stackedit.io/' },
      gHost: { },
      dogfeed: { },
      dogtalk: { },
      // sharesome: { img: 'none' },
      grouptabs: { },
      byoDB: { href: 'http://diafygi.github.io/byoDB/examples/diary/' },
      'time tracker': { href: 'http://shybyte.github.io/unhosted-time-tracker/', img: '/img/time.png' },
      'svg-edit': { href: 'https://svg-edit.5apps.com/editor/svg-editor.html'},
      browser: { href: 'https://remotestorage-browser.5apps.com/' },
      vidmarks: { },
      music: { href: 'https://music-michiel.5apps.com/' },
      drinks: { href: 'https://myfavoritedrinks.5apps.com/' },
      todo: { href: 'https://todomvc.5apps.com/labs/architecture-examples/remotestorage/' },
      'dspace-client': { href: 'https://dspace-nilclass.5apps.com/', img: '/img/dspace.png' },
      strut: { href: 'http://tantaman.github.com/Strut/' },
      //(no rs) TiddlyWiki: { href: 'http://www.tiddlywiki.com/' },
      //(no rs) Fargo: { href: 'http://fargo.io/' },
      // Crypton: { href: 'http://crypton.io/', img: 'none' },
      // Dillinger: { href: 'http://dillinger.io/', img: 'none' },
      // 'freedom js': { href: 'http://freedomjs.org/', img: 'none' },
      // 'Peer CDN': { href: 'https://peercdn.com/', img: 'none' },
      // '+PeerServer': { href: 'http://www.peer-server.com/', img: 'none' },
      // Mylar: { href: 'http://css.csail.mit.edu/mylar/#Software', img: 'none' },
      // CryptoSphere: { href: 'http://cryptosphere.org/', img: 'none' },
      // editor: { href: 'https://editor-michiel.5apps.com/' },
      // social: { href: 'https://social-michiel.5apps.com/' },
      // email: { href: 'https://email-michiel.5apps.com/' },
      // smarkers: { href: 'https://smarker-nilclass.5apps.com/' },
    };
  
  var changeHandler = function() {
    console.log('Please call remoteStorage.apps.onChange(handler)');
  };

  function fillInBlanks(key, obj) {
    obj.href = obj.href || 'https://'+key.toLowerCase()+'.5apps.com/';
    obj.img = obj.img || '/img/'+key.toLowerCase()+'.png';
    obj.name = obj.name || key;
    return obj;
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
    privClient.storeObject('app', name, apps[name]);
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
   * Function: remoteStorage.apps.onChange
   *
   * Set the change event handler. This will be called, with the
   * dictionary of installed apps as the only argument, whenever the
   * list of installed apps changes. Example:
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
  function onChange(handler) {
    changeHandler = handler;
  }

  function init() {
    RemoteStorage.config.changeEvents.window = true;
    privClient.cache('', 'ALL');
    privClient.on('change', function(evt) {
      if (evt.newValue) {
        apps[evt.relativePath] = evt.newValue;
      } else {
        delete apps[evt.relativePath];
      }
      console.log('calling changeHandler with', apps, evt);
      changeHandler(apps);
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
    privClient.declareType('app', {
      type: 'object',
      properties: {
        name: { type: 'string' },
        href: { type: 'string' },
        img: { type: 'string' }
      },
      required: ['name']
    });

    for (var i in defaultApps) {
      defaultApps[i] = fillInBlanks(i, defaultApps[i]);
    }
  }

  function getAsset(appName, assetBase, assetPath) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', assetBase+assetPath, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      pubClient.storeFile(xhr.getResponseHeader('Content-Type'), 'assets/'+appName+'/'+assetPath, xhr.response);
    };
    xhr.send();
  }

  function cloneApp(manifestUrl) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', manifestUrl, true);
    xhr.onload = function() {
      var obj = {};
      try {
        obj = JSON.parse(xhr.responseText);
      } catch (e) {
      }
      var urlParts = manifestUrl.split('/');
      urlParts.pop();
      var assetBase = urlParts.join('/')+'/';
      console.log('got manifest', manifestUrl, obj);
      if (Array.isArray(obj.assets)) {
        for (var i=0; i<obj.assets.length; obj++) {
          getAsset(obj.name, assetBase, obj.assets[i]);
        }
      }
    };
    xhr.send();
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
   *   (none)
   *
   * Returns: A dictionary from string app names to objects that follow the
   *              apps/app schema defined above.
   */
  function getAvailableApps() {
    var i, availableApps = {};
    for (i in defaultApps) {
      if (!apps[i]) {
        availableApps[i] = defaultApps[i];
      }
    } 
    return availableApps;
  }

  //...
  init();

  return {
    exports: {
      onChange: onChange,
      installApp: installApp,
      uninstallApp: uninstallApp,
      getInstalledApps: getInstalledApps,
      getAvailableApps: getAvailableApps,
      cloneApp: cloneApp
    }
  };
});

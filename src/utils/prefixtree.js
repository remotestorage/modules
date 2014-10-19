/**
 * Class: PrefixTree
 *
 * A PrefixTree is a transparent layer on top of a (scoped) baseClient.
 * It allows you to write as many documents as you want (tested up to about
 * 20,000) without using any slashes in their paths. So basically it's then
 * a key-value store, and it will "feel" like these documents are all in the
 * base folder. In reality, PrefixTree creates a folder tree based on key
 * prefixes, and translates keyToPath when going from your module code to the
 * baseClient, and pathToKey when coming back from the baseClient to your
 * module (e.g. in change events).
 * 
 * To use it, simply construct it from a BaseClient, for instance the privateClient
 * which you receive when calling defineModule:
 *
 *     var prefixTree = new PrefixTree(privClient);
 *
 * Then, you can replace all the calls you would usually do to the privClient,
 * and do them to the prefixTree instead. storeObject/getObject, storeFile/getFile,
 * remove, and on are all available. getListing and getAll are not, because
 * they operate on folders, and PrefixTree exposes a non-hierarchical key-value
 * store.
 *
 * To receive one change event for each item currently in the store (e.g. to
 * populate an in-memory representation), you can call:
 *
 *     prefixTree.fireInitial()
 */
PrefixTree = function(baseClient) {
  var maxLeaves=5, minDepth=1;
  //for key=='abcdefgh',
  // depth -> base + itemName:
  // 0 -> + _abcdefgh
  // 1 -> a/ + _bcdefgh
  // 2 -> a/b/ + _cdefgh
  // 3 -> a/b/c/ + _defgh
  // etc...
  function keyToBase(key, depth) {
    return key.slice(0, depth).split('').join('/')+'/';
  }
  function keyToItemName(key, depth) {
    // _ prefix avoids name clash with dir name
    // and serves as the item name if no chars are left
    return '_'+key.slice(depth);
  }
  function pathToKey(path) {
    var parts = path.split('/');
    if (parts[parts.length-1][0] != '_') {
      throw new Error('cannot parse path '+path+' to key');
    }
    parts[parts.length-1] = parts[parts.length-1].substring(1);
    return parts.join('');
  }
  function keyToPath(key, depth) {
    return keyToBase(key, depth)+keyToItemName(key, depth);
  }
  function getKeysAndDirs(path) {
    return baseClient.getListing(path, false).then(function(listing) {
      var itemsMap={}, i, keysHere = [], dirs = [];
      if (typeof(listing)=='object') {
        itemsMap = listing
      } else {
        itemsMap = {};
      }
      for (i in itemsMap) {
        if (i.substr(-1)=='/') {
          dirs.push(path+i);
        } else {
          keysHere.push(i);
        }
      }
      return { keysHere: keysHere, dirs: dirs };
    });
  }
  
  function tryDepth(key, depth, checkMaxLeaves) {
    var thisDir = keyToBase(key, depth);
    return baseClient.getListing(thisDir, false).then(function(itemsMap) {
      if(!itemsMap) {
        itemsMap = {};
      }
      var numDocuments;
      if (itemsMap[keyToItemName(key, depth)]//found it 
          || depth === key.length) {//or can't go deeper
        return depth;
      }
      if (itemsMap[key[depth]+'/']) {//go deeper
        return tryDepth(key, depth+1, checkMaxLeaves);
      }
      if (checkMaxLeaves) {
        numDocuments = 0;
        for (i in itemsMap) {
          if (i.substr(-1) != '/') {
            numDocuments++;
          }
        }
        if (numDocuments >= maxLeaves) {//start new subtree for this char
          return depth+1;
        }
      }//this depth is OK
      return depth;
    });
  }
  
  return {
    /**
     * Method: setMaxLeaves
     *
     * Control the internal maxLeaves variable. To get a small tree with
     * large folders, choose a high value. If you prefer a large tree with small
     * folders, choose a low value. This influences the ideal number of documents
     * (tree leaves) in any folder, it does not limit the number of subfolders.
     * By default, maxLeaves = 5.
     *
     *
     * Parameters:
     *   val   - number, the value to set maxLeaves to.
     *
     */
    setMaxLeaves: function(val) {
      maxLeaves = val;
    },
    /**
     * Method: getFile
     *
     * The equivalent of BaseClient.getFile
     *
     * Parameters:
     *   key   - string, the key, corresponding to the path (should not contain slashes).
     *
     * Returns:
     *   A promise like the one from BaseClient.getFile.
     */
    getFile: function(key) {
      return tryDepth(key, minDepth, false).then(function(depth) {
        return baseClient.getFile(keyToPath(key, depth), false);
      }, function(err) {
        console.log('getFile error', key, err.message);
      });
    },
    /**
     * Method: storeFile
     *
     * The equivalent of BaseClient.storeFile
     *
     * Parameters:
     *   mimeType  - string, like for BaseClient.storeFile
     *   key       - string, the key, corresponding to the path (should not contain slashes).
     *   body      - string or ArrayBuffer, like for BaseClient.storeFile
     *
     * Returns:
     *   A promise like the one from BaseClient.storeFile.
     */
    storeFile: function(mimeType, key, body) {
      return tryDepth(key, minDepth, true).then(function(depth) {
        return baseClient.storeFile(mimeType, keyToPath(key, depth), body);
      }, function(err) {
        console.log('storeFile error', mimeType, key, body, err.message);
      });
    },
    /**
     * Method: getObject
     *
     * The equivalent of BaseClient.getObject
     *
     * Parameters:
     *   key       - string, the key, corresponding to the path (should not contain slashes).
     *
     * Returns:
     *   A promise like the one from BaseClient.getObject.
     */
    getObject: function(key) {
      return tryDepth(key, minDepth, false).then(function(depth) {
        return baseClient.getObject(keyToPath(key, depth), false);
      }, function(err) {
        console.log('getObject error', key, err.message);
      });
    },
    /**
     * Method: remove
     *
     * The equivalent of BaseClient.remove
     *
     * Parameters:
     *   key       - string, the key, corresponding to the path (should not contain slashes).
     *
     * Returns:
     *   A promise like the one from BaseClient.remove.
     */
    remove: function(key) {
      return tryDepth(key, minDepth, false).then(function(depth) {
        return baseClient.remove(keyToPath(key, depth));
      }, function(err) {
        console.log('remove error', key, err.message);
      });
    },
    /**
     * Method: storeObject
     *
     * The equivalent of BaseClient.storeObject
     *
     * Parameters:
     *   typeAlias  - string, like for BaseClient.storObject
     *   key       - string, the key, corresponding to the path (should not contain slashes).
     *   body      - object, like for BaseClient.storeObject
     *
     * Returns:
     *   A promise like the one from BaseClient.storeFile.
     */
    storeObject: function(typeAlias, key, obj) {
      return tryDepth(key, minDepth, true).then(function(depth) {
        return baseClient.storeObject(typeAlias, keyToPath(key, depth), obj);
      }, function(err) {
        console.log('storeObject error', typeAlias, key, obj, err.message);
      });
    },
    changeHandlers: [],
    /**
     * Method: on
     *
     * The equivalent of BaseClient.on
     *
     * Parameters:
     *   eventName - string, like for BaseClient.on
     *   cb        - function, like for BaseClient.on
     *
     * Returns:
     *   A promise like the one from BaseClient.getObject, except that the event
     *   will contain a 'key' field, corresponding to the path.
     */
    on: function(event, cb) {
      if(event==='change') {
        baseClient.on('change', function(evt) {
          try {
            evt.key = pathToKey(evt.relativePath);
          } catch (err) {
            return;
          }
          cb(evt);
        });
        this.changeHandlers.push(cb);
      } else {
        baseClient.on(event, cb);
      }
    },
    fireLocal: function(path) {
      baseClient.getFile(path, false).then(function(obj) {
        var j;
        if (obj) {
          for (j=0; j<this.changeHandlers.length; j++) {
            this.changeHandlers[j]({
              key: pathToKey(path),
              origin: 'local',
              newValue: obj.data,
              newContentType: obj.mimeType
            });
          }
        }
      }.bind(this));
    },
    /**
     * Method: fireInitial
     *
     * Will trigger one change event for each document currently in the tree.
     * These events will have origin 'local'.
     *
     * Parameters:
     *   dirs - to be left undefined
     */
    fireInitial: function(dirs) {
      var thisPrefix;
      if (Array.isArray(dirs)) {
        if (dirs.length) {
          thisPrefix = dirs.pop();
        } else {
          return Promise.resolve();
        }
      } else {
        dirs = [];
        thisPrefix = '';
      }

      return getKeysAndDirs(thisPrefix).then(function(keysAndDirs) {
        for (var i in keysAndDirs.keysHere) {
          this.fireLocal(thisPrefix+keysAndDirs.keysHere[i]);
        }
        //TODO: try out whether parallelizing requests here would improve performance
        return this.fireInitial(dirs.concat(keysAndDirs.dirs));
      }.bind(this));
    }
  };
};

if (typeof(global) !== 'undefined') {
  global.PrefixTree = PrefixTree;
}

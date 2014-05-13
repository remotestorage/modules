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
      var itemsMap={}, i, keys = [], dirs = [];
      if (typeof(listing)=='object') {
        itemsMap = listing
      } else {
        itemsMap = {};
      }
      for (i in itemsMap) {
        if (i.substr(-1)=='/') {
          dirs.push(path+i);
        } else {
          keys.push(pathToKey(path+i));
        }
      }
      return { keys: keys, dirs: dirs };
    });
  }
  
  function tryDepth(key, depth, checkMaxLeaves) {
    var thisDir = keyToBase(key, depth);
    return baseClient.getListing(thisDir, false).then(function(itemsMap) {
      if(!itemsMap) {
        itemsMap = {};
      }
      var numDocuments;
      if (itemsMap[keyToItemName(key, depth)]) {//found it
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
  function storeObject(typeAlias, key, obj) {
    return tryDepth(key, minDepth, true).then(function(depth) {
      return baseClient.storeObject(typeAlias, keyToPath(key, depth), obj);
    }, function(err) {
      console.log('storeObject error', typeAlias, key, obj, err.message);
    });
  }
  
  return {
    setMaxLeaves: function(val) {
      maxLeaves = val;
    },
    getFile: function(key) {
      return tryDepth(key, minDepth, false).then(function(depth) {
        return baseClient.getFile(keyToPath(key, depth), false);
      }, function(err) {
        console.log('getFile error', key, err.message);
      });
    },
    storeFile: function(mimeType, key, body) {
      return tryDepth(key, minDepth, true).then(function(depth) {
        return baseClient.storeFile(mimeType, keyToPath(key, depth), body);
      }, function(err) {
        console.log('storeFile error', mimeType, key, body, err.message);
      });
    },
    getObject: function(key) {
      return tryDepth(key, minDepth, false).then(function(depth) {
        return baseClient.getObject(keyToPath(key, depth), false);
      }, function(err) {
        console.log('getObject error', key, err.message);
      });
    },
    remove: function(key) {
      return tryDepth(key, minDepth, false).then(function(depth) {
        return baseClient.remove(keyToPath(key, depth));
      }, function(err) {
        console.log('remove error', key, err.message);
      });
    },
    storeObject: storeObject,
    changeHandlers: [],
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
    fireInitial: function(dirs) {
      var thisPrefix, promise;
      if (Array.isArray(dirs)) {
        if (dirs.length) {
          thisPrefix = dirs.pop();
        } else {
          promise = promising();
          promising.fulfill();
          return promise;
        }
      } else {
        dirs = [];
        thisPrefix = '';
      }

      return getKeysAndDirs(thisPrefix || '').then(function(keysAndDirs) {
        for (var i in keysAndDirs.keys) {
          baseClient.get(keyToPath(keysAndDirs.key[i]), false).then(function(obj) {
            var j;
            if (obj) {
              for (j=0; j<this.changeHandlers.length; j++) {
                this.changeHandlers[j]({
                  origin: 'local',
                  newValue: obj.data,
                  newContentType: obj.mimeType
                });
              }
            }
          });
        }
        //TODO: try out whether parallelizing requests here would improve performance
        return this.fireInitial(dirs.concat(keysAndDirs.dirs));
      });
    }
  };
};

if (global) {
  global.PrefixTree = PrefixTree;
}

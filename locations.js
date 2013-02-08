remoteStorage.defineModule('locations', function(privClient, pubClient) {

  var curry = remoteStorage.util.curry;

  var watchers = {};

  var events = remoteStorage.util.getEventEmitter(
    'add-collection',
    'remove-collection',
    'update-collection',
    'add-feature',
    'remove-feature',
    'update-feature'
  );

  function dispatchChange(event) {
    var type = (event.newValue || event.oldValue)['@type'];
    var thing;
    switch(type) {
    case pubClient.resolveType('collection'):
      thing = 'collection';
      break;
    case pubClient.resolveType('feature'):
      thing = 'feature';
      break;
    }
    if(thing) {
      if(! event.oldValue) {
        events.emit('add-' + thing, event);
      } else if(!event.newValue) {
        events.emit('remove-' + thing, event);
      } else {
        events.emit('update-' + thing, event);
      }
    }
  }

  var initialFired = false;

  function fireInitial() {
    console.log('fireInitial');
    if(initialFired) {
      return;
    }
    pubClient.getAll('collections/').
      then(function(collections) {
        console.log('collections', collections);
        if(collections && Object.keys(collections).length > 0) {
          initialFired = true;
        }
        var collection;
        for(var id in collections) {
          events.emit('add-collection', {
            newValue: collections[id],
            path: 'collections/' + id
          });
        }
      });
  }

  return {
    exports: remoteStorage.util.extend({

      client: pubClient,

      init: function() {
        return privClient.release('').
          then(curry(pubClient.release, '')).
          then(curry(pubClient.use, 'collections/')).
          then(curry(pubClient.use, 'features/', true)).
          then(function() {
            remoteStorage.onWidget('ready', fireInitial);
          });
      },

      addCollection: function(name) {
        return pubClient.getObject('collections/' + name).
          then(function(collection) {
            if(! collection) {
              collection = { name: name, features: [], type: 'FeatureCollection' };
            }
            return pubClient.storeObject('collection', 'collections/' + name, collection);
          });
      },

      removeCollection: function(name) {
        return pubClient.remove('collections/' + name);
      },

      getCollection: function(name) {
        return pubClient.getObject('collections/' + name).
          then(function(collection) {
            if(! collection) {
              collection = { name: name, features: [], type: 'FeatureCollection' };
            }

            function reload() {
              return pubClient.getObject('collections/' + name).
                then(function(c) {
                  if(typeof(c) === 'object') {
                    collection = c;
                  }
                });
            }

            if(! watchers[name]) {
              watchers[name] = [];
            }
            return {
              getFeatures: function() {
                return reload().then(function() {
                  return remoteStorage.util.
                    asyncMap(collection.features, function(feature) {
                      // features are expected to be objects, ...
                      if(typeof(feature) === 'object') {
                        return feature;
                      } else {
                        // ... or relative paths to the actual features.
                        return pubClient.getObject(feature);
                      }
                    });
                });
              },

              addFeature: function(feature) {
                if(! feature.id) {
                  if('uuid' in Math) {
                    feature.id = Math.uuid();
                  } else {
                    throw "Feature requires an ID (and Math.uuid cannot be found to generate one)";
                  }
                }
                if(! feature.type) {
                  feature.type = 'Feature';
                }
                var path = 'features/' + feature.id
                for(var i in collection.features) {
                  if(collection.features[i] === path) {
                    // already have this feature!
                    return;
                  }
                }
                return reload().then(function() {
                  return pubClient.storeObject('feature', path, feature);
                }).
                  then(function() {
                    collection.features.push(path);
                    return pubClient.storeObject(
                      'collection', 'collections/' + name, collection
                    );
                  }).
                  then(function() {
                    console.log('added feature', feature);
                    watchers[name].forEach(function(watcher) {
                      watcher('add', feature);
                    });
                    return feature;
                  });
              },

              watch: function(callback) {
                watchers[name].push(callback);
              }
            };
          });
      }

    }, events)
  };
  
});


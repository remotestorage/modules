/**
 * Class: SyncedMap
 *
 * Holds an in-memory structure with potentially thousands of items.
 * Relies on PrefixTree for storing this structure to remoteStorage.
 *
 */
function SyncedMap(name, baseClient) {
  var data = {}, prefixTree = new PrefixTree(baseClient.scope(name+'/'));
  prefixTree.on('change', function(evt) {
    if (evt.origin != 'window') {
      try {
        data[evt.key] = JSON.parse(evt.newValue);
      } catch(err) {
      }
    }
  });
  return {
    /**
     * Function: get
     *
     * Retrieve one of the items from the in-memory store. Make sure to call load before
     * calling this function.
     *
     * Parameters:
     *   key - string, the identifier of the item to be retrieved. Should not contain slashes.
     *
     * Returns:
     *   The current value of the item identified by <key>, or undefined if the item doesn't
     *   exist. Will also return undefined if the item was not loaded yet.
     */
    get: function(key) {
      return data[key];
    },
    /**
     * Function: set
     *
     * Store an item into the in-memory store, under a key that identifies it uniquely.
     *
     * Parameters:
     *   key - string, the identifier of the item to be retrieved. Should not contain slashes.
     *   val - anything JSON-stringifiable (so objects and simple types are OK, but no ArrayBuffers and such).
     *
     */
    set: function(key, val) {
      prefixTree.storeFile('application/json', key, JSON.stringify(val));
      data[key]=val;
    },
    /**
     * Function: remove
     *
     * Remove an item from the in-memory store, from under a key that identifies it uniquely.
     *
     * Parameters:
     *   key - string, the identifier of the item to be removed. Should not contain slashes.
     *
     */
    remove: function(key) {
      prefixTree.remove(key);
      delete data[key];
    },
    /**
     * Function: getKeys
     *
     * Returns the keys of all items currently loaded into the in-memory store.
     *
     * Returns:
     *   An Array of String, each string being one item key.
     *
     */
    getKeys: function() {
      return Object.getOwnPropertyNames(data);
    },
    /**
     * Function: load
     *
     * Load the data into memory after a page refresh. When the user connects their storage,
     * data will come in and will be loaded automatically. Also, data that was stored into
     * the SyncedMap since the last page refresh will stay loaded automatically. The only
     * situation where the memory is flushed and you need to call SyncedMap.load, is when
     * the user refreshes the page, or closes and reopens the tab, closes and reopens the browser,
     * or turns the device off and on again.
     *
     * Returns:
     *   A promise that fulfills when all items have been loaded from IndexedDB, through the BaseClient
     *   and the PrefixTree, into the SyncedMap (and therefore into memory).
     *
     */
    load: function(key) {
      return prefixTree.fireInitial();
    }
  };
}

if (typeof(global) !== 'undefined') {
  global.SyncedMap = SyncedMap;
}

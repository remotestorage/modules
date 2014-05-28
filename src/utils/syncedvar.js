/**
* Class: SyncedVar
*
* Holds an in-memory variable, synced directly to a document in remoteStorage.
* It can hold either a String, or an ArrayBuffer.
*
* Parameters:
*   storagePath - String; this will be used as the document path when storing to remoteStorage.
*   baseClient  - An instance of BaseClient. Make sure the caching strategy for storagePath on
*                 baseClient is set to 'ALL'.
*/
function SyncedVar(storagePath, baseClient) {
  var data, loaded = false;
  baseClient.on('change', function(e) {
    if(e.relativePath === storagePath) {
      data = e.newValue;
    }
  });

  return {
    /**
    * Function: get
    *
    * Retrieve the variable from the in-memory store. Make sure to call load before
    * calling this function.
    *
    * Returns:
    * The current value of the variable (String or ArrayBuffer), or undefined if it was not loaded yet.
    */
    get: function() {
      return data;
    },
    /**
    * Function: set
    *
    * Store a string or ArrayBuffer value into the in-memory variable.
    *
    * Parameters:
    * val - a string or an ArrayBuffer.
    *
    */
    set: function(val) {
      baseClient.storeFile('application/octet-stream', storagePath, val);
      data=val;
    },
    /**
    * Function: load
    *
    * Load the variable into memory after a page refresh. When the user connects their storage,
    * data will come in and will be loaded automatically. Also, data that was stored into
    * the SyncedVar since the last page refresh will stay loaded automatically. The only
    * situation where the memory is flushed and you need to call SyncedVar.load, is when
    * the user refreshes the page, or closes and reopens the tab, closes and reopens the browser,
    * or turns the device off and on again.
    *
    * Returns:
    * A promise that fulfills when the value has been loaded from IndexedDB, through the BaseClient,
    * into the SyncedVar (and therefore into memory).
    *
    */
    load: function() {
      return baseClient.getFile(storagePath, false).then(function(res) {
        data = res.data;
      });
    }
  };
}

if (typeof(global) !== 'undefined') {
  global.SyncedVar = SyncedVar;
}

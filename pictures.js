

// Pictures
//
// This module stores collections of pictures, called "albums".
// Each folder at the root of the module is treated as an album,
// unless it starts with a dollar sign ($)
//

remoteStorage.defineModule('pictures', function(privateClient, publicClient) {

  var isDir = remoteStorage.util.isDir;

  // Albums only work, when the user is connected and online.
  var Album = function(name, client) {
    this.name = name;
    this.client = client;
    this.prefix = encodeURIComponent(this.name) + '/';

    // Sync all picture names, but not the pictures themselves.
    // this.client.use(this.prefix, true);

    // Bind all the things
    remoteStorage.util.bindAll(this);
  };

  Album.prototype = {

    // Store image with given MIME type under the given name.
    // The given `data` is expected to be an `ArrayBuffer`.
    //
    // Returns a promise, which will be fulfilled with the
    // absolute URL of the newly uploaded picture.
    // See `getPictureURL` for details.
    store: function(mimeType, fileName, data) {
      return this.client.storeFile(
        mimeType,
        this._path(fileName),
        data,
        false // << skip the cache
      ).then(function() {
        return this.getPictureURL(fileName);
      }.bind(this));
    },

    remove: function(fileName) {
      return this.client.remove(this._path(fileName));
    },

    // Get a list of all pictures in this album.
    list: function() {
      return this.client.getListing(this.prefix).
        then(function(listing) {
          return listing.map(decodeURIComponent);
        });
    },

    // Get the absolute URL for the picture with the given `fileName`.
    // Useful for displaying a public picture using the `src` attribute
    // of an `<img>` element.
    getPictureURL: function(fileName) {
      return this.client.getItemURL(this._path(fileName));
    },

    close: function() {
      this.client.release(this.prefix);
    },

    _path: function(fileName) {
      return this.prefix + encodeURIComponent(fileName);
    }

  };

  function filterAlbumListing(listing) {
    var albums = [];
    listing.forEach(function(item) {
      if(isDir(item) && item[0] !== '$') {
        albums.push(item.replace(/\/$/, '')); // strip trailing slash.
      }
    });
    return albums;
  }

  var pictures = {

    init: function() {
      privateClient.release('');
      publicClient.release('');
    },

    getUuid: privateClient.uuid,

    // Open album with given `name`. This will sync the list of images
    // and make them accessible via the returned `Album` object.
    openPublicAlbum: function(name) {
      return new Album(name, publicClient);
    },

    listPublicAlbums: function() {
      return publicClient.getListing('').then(filterAlbumListing);
    },

    openPrivateAlbum: function(name) {
      return new Album(name, privateClient);
    },

    listPrivateAlbums: function() {
      return privateClient.getListing('').then(filterAlbumListing);
    }

  };

  return {
    exports: pictures
  };

});

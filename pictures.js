

// Pictures
//
// This module stores collections of pictures, called "albums".
// Each folder at the root of the module is treated as an album,
// unless it starts with a dollar sign ($)
//

RemoteStorage.defineModule('pictures', function(privateClient, publicClient) {

  function isDir(path) {
    return path.substr(-1) == '/';
  }

  // Albums only work, when the user is connected and online.
  var Album = function(name, client) {
    this.name = name;
    this.client = client.scope(encodeURIComponent(name) + '/');
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
        data
      ).then(function() {
        return this.getPictureURL(fileName);
      }.bind(this));
    },

    remove: function(fileName) {
      return this.client.remove(fileName);
    },

    // Get a list of all pictures in this album.
    list: function() {
      return this.client.getListing('').
        then(function(listing) {
          return listing.map(decodeURIComponent);
        });
    },

    // Get the absolute URL for the picture with the given `fileName`.
    // Useful for displaying a public picture using the `src` attribute
    // of an `<img>` element.
    getPictureURL: function(fileName) {
      return this.client.getItemURL(fileName);
    },

    close: function() {
      this.client.cache('', false);
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

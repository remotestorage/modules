// Pictures
//
// Maintainer: Sebastian Kippe <sebastian@kip.pe>
// Version:    0.8.0
//
// This module stores collections of pictures, called "albums".
// Each folder at the root of the module is treated as an album,
// unless it starts with a dollar sign ($).
//

RemoteStorage.defineModule('pictures', function(privateClient, publicClient) {

  /**
   * Class: Album
   *
   * An album is a collection of pictures.
   * If caching is enabled for an album (see <Album.open> code), consider the
   *  method <Album.close> to end caching the very album(s).
   */
  var Album = function(name, client) {
    /**
     * Property: name
     *
     * The <Album> name.
     */
    this.name = name;

    /**
     * Property: client
     *
     * The <BaseClient> instance scopped on this album.
     */
    this.client = client.scope(encodeURIComponent(name) + '/');
  };

  Album.prototype = {

    /**
     * Method: store
     *
     * Store a picture.
     *
     * If the picture belongs to a public album, this URL can be used to display
     *  the picture without authentication.
     *
     * Parameters:
     *   mimeType - the picture MIME type.
     *   name     - the picture name.
     *   data     - the picture (expected as an `ArrayBuffer`).
     *
     * Returns:
     *   A promise, which will be fulfilled with the absolute URL of the newly
     *    uploaded picture (see <getPictureURL>).
     */
    store: function(mimeType, name, data) {
      return this.client.storeFile(mimeType, name, data)
        .then(function() {
          return this.getPictureURL(name);
        }.bind(this));
    },

    /**
     * Method: remove
     *
     * Remove a picture.
     *
     * Parameters:
     *   name - the picture name.
     */
    remove: function(name) {
      return this.client.remove(name);
    },

    /**
     * Method: list
     *
     * List the pictures.
     *
     * Returns:
     *   An array with the album pictures names.
     */
    list: function() {
      return this.client.getListing('')
        .then(function(listing) {
          if (listing)
            return listing.map(decodeURIComponent);
          else
            return [];
        });
    },

    /**
     * Method: getPictureURL
     *
     * Get the absolute URL of a picture.
     *
     * If the picture belongs to a public album, this URL can be used to display
     *  the picture without authentication.
     *
     * Parameters:
     *   name - the picture name.
     *
     * Returns:
     *   The absolute URL of the picture.
     */
    getPictureURL: function(name) {
      return this.client.getItemURL(name);
    },

    open: function() {
      // Un-comment the following lines to enable caching an album. It should
      //  be noted that this action will cache both the pictures names and the
      //  pictures data.
      //~ // enable caching for this album
      //~ this.client.cache('', true);

      return this;
    },

    close: function() {
      // disable caching for this album
      this.client.cache('', false);
    }

  };

  // Helper methods

  function isDir(path) {
    return path.substr(-1) === '/';
  }

  function filterAlbumListing(listing) {
    var albums = [];
    listing.forEach(function(item) {
      if(isDir(item) && item[0] !== '$') {
        albums.push(item.replace(/\/$/, '')); // strip trailing slash
      }
    });
    return albums;
  }

  return {
    exports: {

      getUuid: privateClient.uuid,

      /**
       * Method: listPublicAlbums
       *
       * List the public albums.
       *
       * Returns:
       *   An array with the albums names.
       */
      listPublicAlbums: function() {
        return publicClient.getListing('').then(filterAlbumListing);
      },

      /**
       * Method: listPrivateAlbums
       *
       * List the private albums.
       *
       * Returns:
       *   An array with the albums names.
       */
      listPrivateAlbums: function() {
        return privateClient.getListing('').then(filterAlbumListing);
      },

      /**
       * Method: openPublicAlbum
       *
       * Open a public album.
       *
       * The album is synchronized and then returned.
       *
       * Parameters:
       *   name - the album name.
       *
       * Returns:
       *   The (synchronized) album.
       */
      openPublicAlbum: function(name) {
        return new Album(name, publicClient).open();
      },

      /**
       * Method: openPrivateAlbum
       *
       * Open a private album.
       *
       * The album is synchronized and then returned.
       *
       * Parameters:
       *   name - the album name.
       *
       * Returns:
       *   The (synchronized) album.
       */
      openPrivateAlbum: function(name) {
        return new Album(name, privateClient).open();
      }

    }
  };

});


var allContactsList;
var searchResultsList;

function escape(html) {
  return html.replace(/[<>]/g, function(c) {
    return c === '>' ? '&gt;' : '&lt;';
  });
}

var app = {
  add: function(attributes) {
    return remoteStorage.contacts.add(attributes);
  },

  search: function(query) {
    if(query.length >= 2) {
      remoteStorage.contacts.search(query).then(function(results) {
        this.displayResults(query, results);
      }.bind(this));
    } else {
      searchResultsList.innerHTML = '';
    }
  },

  displayResults: function(query, results) {
    searchResultsList.innerHTML = '';
    results.forEach(function(id) {
      var item = document.createElement('li');
      remoteStorage.contacts.get(id).then(function(contact) {
        item.innerHTML = remoteStorage.contacts.highlightNgrams(
          query, escape(contact.fn), function(snippet) {
            return '<strong>' + snippet + '</strong>';
          }
        );
      });
      searchResultsList.appendChild(item);
    });
  },

  displayContact: function(contact) {
    var item = document.createElement('li');
    item.innerHTML = (contact.fn);
    var removeLink = document.createElement('a');
    removeLink.innerHTML = '[remove]';
    removeLink.addEventListener('click', function() {
      remoteStorage.contacts.remove(contact).
        then(function() {
          allContactsList.removeChild(item);
        });
    });
    item.appendChild(removeLink);
    allContactsList.appendChild(item);
  },

  reload: function() {
    allContactsList.innerHTML = '';
    remoteStorage.contacts.all().then(function(contacts) {
      contacts.forEach(app.displayContact);
    });
  }
};

window.onload = function() {
  remoteStorage.claimAccess('contacts', 'rw');
  remoteStorage.displayWidget();

  allContactsList = document.getElementById('all');
  searchResultsList = document.getElementById('results');

  remoteStorage.contacts.on('change', function(event) {
    if(typeof(event.newValue) === 'object' && 
       event.newValue['@context'] === 'http://json-schema.org/card') {
      app.displayContact(event.newValue);
    }
  });

  document.getElementById('search-box').onkeyup = function(event) {
    app.search(event.target.value);
  };

  document.getElementById('add-form').onsubmit = function(event) {
    event.preventDefault();
    var attributes = {
      fn: event.target.fn.value
    };
    event.target.fn.value = '';
    app.add(attributes);
    return false;
  };

  remoteStorage.on('ready', app.reload);
  remoteStorage.on('disconnect', app.reload);
  app.reload();
}

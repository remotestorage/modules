remoteStorage.defineModule('contacts', function(privateClient, publicClient) {
  
  // declaring data type "contact"
  privateClient.declareType('contact', 'http://json-schema.org/card', {
    "$schema": "http://json-schema.org/draft-03/schema#",
    "description": "A representation of a person, company, organization, or place",
    "type": "object",
    "properties": {
        "fn": {
            "description": "Formatted Name",
            "type": "string"
        },
        "familyName": { "type": "string", "required": true },
        "givenName": { "type": "string", "required": true },
        "additionalName": { "type": "array", "items": { "type": "string" } },
        "honorificPrefix": { "type": "array", "items": { "type": "string" } },
        "honorificSuffix": { "type": "array", "items": { "type": "string" } },
        "nickname": { "type": "string" },
        "url": { "type": "string", "format": "uri" },
        "email": {
            "type": "object",
            "properties": {
                "type": { "type": "string" },
                "value": { "type": "string", "format": "email" }
            }
        },
        "tel": {
            "type": "object",
            "properties": {
                "type": { "type": "string" },
                "value": { "type": "string", "format": "phone" }
            }
        },
        "adr": { "$ref": "http: //json-schema.org/address" },
        "geo": { "$ref": "http: //json-schema.org/geo" },
        "tz": { "type": "string" },
        "photo": { "type": "string" },
        "logo": { "type": "string" },
        "sound": { "type": "string" },
        "bday": { "type": "string", "format": "date" },
        "title": { "type": "string" },
        "role": { "type": "string" },
        "org": {
            "type": "object",
            "properties": {
                "organizationName": { "type": "string" },
                "organizationUnit": { "type": "string" }
            }
        }
    }
  });
  return {
    // function to return the right directory for indices
    function getIndexDirectory(str)
    {
      var words = str.split(' ');
      for(var i=0;i<words.length;i++) {
        if(words[i].length>=3) {
          privateClient.storeObject('link', 'prefix/'+str.substring(0, 3)+'/'+uuid, {
            links: [
              {
                type: 'full',
              }
            ]
          });
        }
      }
    }
    exports: {
      setContact: function (contact) {
        // validate before indexing
        var validationErrors = validateObject(contact, 'http://json-schema.org/card');
        if(!validationErrors)
        {
          // faily- + given + -nickname + email + uuid -> Index
          
          
          privateClient.storeObject("contact", "card/" + privateClient.uuid(), contact);
        }
        else
        {
          console.log("Validation failed: ", validationErrors);
        }
        return privateClient.storeObject("contact", "card/" + privateClient.uuid(), contact);
      },
      getContact: function (uuid) {
        return privateClient.getObject("card/" + uuid);
      }
      searchContact: function (string, directory) {
        // search in directory w. string
      },
    }
  };
});

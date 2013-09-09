//
// Tasks
//
// TODO Add some documentation
//

remoteStorage.defineModule('tasks', function(privateClient) {

  var util = remoteStorage.util;

  privateClient.declareType('todo', {
    "type": "object",
    "description": "A single-line task on your todo list.",
    "properties": {
      "id": {
        "type": "string",
        "format": "id"
      },
      "title": {
        "type": "string"
      },
      "completed": {
        "type": "boolean",
        "default": false
      }
    },
    "required": [ "id", "title", "completed" ]
  });

  var tasks = {

    todos: {

      getAll: function() {
        return privateClient.getAll('todos/', 'todo').then(function(todos) {
          return Object.keys(todos).map(function(id) {
            return todos[id];
          });
        });
      },

      store: function(object) {
        var todo = privateClient.buildObject('todo', object);

        return privateClient.storeObject('todo', 'todos/'+todo.id, todo).
          then(function(){
            return todo;
          });
      },

      setTodoTitle: function(id, title) {
        return privateClient.getObject('todos/'+id).then(function(todo) {
          todo.title = title;
          return privateClient.storeObject('todo', 'todos/'+id, todo);
        });
      },

      setTodoCompleted: function(id, value) {
        return privateClient.getObject('todos/'+id).then(function(todo) {
          todo.completed = value;
          return privateClient.storeObject('todo', 'todos/'+id, todo);
        });
      },

      setAllCompleted: function(value) {
        var self = this;
        return self.getAll().then(function(todos) {
          return util.asyncEach(todos, function(todo) {
            return self.store(util.extend(todo, { completed: true }));
          });
        });
      },

      remove: function(id) {
        return privateClient.remove('todos/'+id);
      },

      removeAllCompleted: function() {
        var self = this;
        return self.getAll().then(function(todos) {
          return util.asyncEach(todos, function(todo) {
            return self.remove(todo.id);
          });
        });
      }
    }
  };

  util.extend(tasks.todos, util.getEventEmitter('change'));

  // You can use the change event like so from your app:
  //
  //     remoteStorage.tasks.todos.on('change', function(event){
  //       console.log(event.origin, event.id, event.oldValue, event.newValue);
  //     })
  //
  privateClient.on('change', function(event) {
    var md = event.relativePath.match(/^todos\/(.+)$/);
    if (md) {
      event.id = md[1];
      tasks.todos.emit('change', event);
    }
  });

  return { exports: tasks };
});

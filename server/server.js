/**
 * Loads server and database configurations.
 */
require('./config/config.js');

/**
 * Third-party modules required to run the app.
 */
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

/**
 * Custom modules required to run the app.
 */
var {
  mongoose
} = require('./db/mongoose');
var {
  Todo
} = require('./models/todo');
var {
  User
} = require('./models/user');
var {
  authenticate
} = require('./middleware/authtenticate');

var {
  ObjectID
} = require('mongodb');

/**
 * App definition and Port definition
 */
var app = express();
var PORT = process.env.PORT;

// Method to parse objects to database.
app.use(bodyParser.json())

/**
 *  API routing to allow HTTP method POST
 */
app.post('/todos', (request, response) => {
  var todo = new Todo({
    text: request.body.text
  });
  todo.save().then((doc) => {
    response.send(doc);
  }, (error) => {
    response.status(400).send(error);
  })
});

/**
 *  API routing to allow HTTP method GET
 */
app.get('/todos', (request, response) => {
  Todo.find().then((todos) => {
    response.send({
      todos
    })
  }, (error) => {
    response.status(400).send(error);
  });
});

/**
 * API routing to get a todo object by ID.
 * It verifies if the ID is valid from the MongoDB library, returns a 404 if 
 * not valid;
 * Checks if the return of findById is not empty, if so returns a 404, if not 
 * returns the object itself.
 * If any other error occurs, it returns a 400 status code.
 */
app.get('/todos/:id', (request, response) => {
  var todoId = request.params.id;

  if (!ObjectID.isValid(todoId)) {
    return response.status(404).send();
  }

  Todo.findById(todoId).then((todo) => {
    if (!todo) {
      return response.status(404).send();
    }
    response.send({
      todo
    });
  }).catch((error) => {
    response.status(404).send();
  });
});

/**
 * Route to delete a todo item by id.
 * Checks if the ID is valid from the MongoDB library, returns a 404 if not.
 * Checks if the the todo is non empty, if it is returns a 404 not found.
 * If any other error occurs, it returns a 400 status code.
 */
app.delete('/todos/:id', (request, response) => {
  var todoId = request.params.id;

  if (!ObjectID.isValid(todoId)) {
    return response.status(404).send();
  }

  Todo.findByIdAndRemove(todoId).then((todo) => {
    if (!todo) {
      return response.status(404).send();
    }
    response.send({
      todo
    });
  }).catch((error) => {
    response.status(400).send();
  });
});

/**
 * Method to update a todo item.
 * Receiving an ID and a body parameter, it allows an user to set a todo item
 * as completed (and updates the field completedAt) or change the todo text body.
 * It never allows the user to change the completedAt field.
 */
app.patch('/todos/:id', (request, response) => {
  var id = request.params.id;
  var body = _.pick(request.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return response.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {
    $set: body
  }, {
    new: true
  }).then((todo) => {
    if (!todo) {
      return response.status(404).send();
    }

    response.send({
      todo
    });

  }).catch((error) => {
    response.status(404).send();
  })
});

// POST /users
app.post('/users', (request, response) => {
  var body = _.pick(request.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    var token = user.generateAuthToken();
    return token;
  }).then((token) => {
    response.header('x-auth', token).send({user});
  }).catch((e) => {
    response.status(400).send(e);
  })
});



app.get('/users/me', authenticate, (request, response) => {
  response.send(request.user);
})

/**
 * Connects to localhost:3000 server
 */
app.listen(PORT, () => {
  console.log(`Started at port ${PORT}`);
});

module.exports = {
  app
};
/**
 * Third-party modules required to run the app
 */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

/**
 * Custom modules required to run the app
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
  ObjectID
} = require('mongodb');

/**
 * App definition and routing
 * Port definition
 */
var app = express();
var PORT = process.env.PORT || 3000;

// Method to parse objects to database.
app.use(bodyParser.json())

/**
 *  Middleware to accept HTTP method POST
 */
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

/**
 *  Middleware to accept HTTP method GET
 */
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    })
  }, (e) => {
    res.status(400).send(e);
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
app.get('/todos/:id', (req, res) => {
  var todoId = req.params.id;

  if (!ObjectID.isValid(todoId)) {
    return res.status(404).send();
  }

  Todo.findById(todoId).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({
      todo
    });
  }).catch((e) => {
    res.status(404).send();
  });
});

/**
 * Route to delete a todo item by id.
 * Checks if the ID is valid from the MongoDB library, returns a 404 if not.
 * Checks if the the todo is non empty, if it is returns a 404 not found.
 * If any other error occurs, it returns a 400 status code.
 */
app.delete('/todos/:id', (req, res) => {
  var todoId = req.params.id;

  if (!ObjectID.isValid(todoId)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(todoId).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({
      todo
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

/**
 * Connects to localhost:3000 server
 */
app.listen(PORT, () => {
  console.log(`Started at port ${PORT}`);
});

module.exports = {
  app
};
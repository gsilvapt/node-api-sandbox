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
 */
var app = express();

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
 * Connects to localhost:3000 server
 */
app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {
  app
};
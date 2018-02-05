/**
 * Third-party modules required to run the app
 */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

/**
 * Custom modules required to run the app
 */
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {user} = require('./models/user');

/**
 * App definition and routing
 */
var app = express();

// Method to parse objects to database.
app.use(bodyParser.json())

// Middleware to accept HTTP method POST
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
 * Connects server
 */
app.listen(3000, () => {
  console.log('Started on port 3000');
});
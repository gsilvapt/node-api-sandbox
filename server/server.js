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
} = require('./middleware/authenticate');

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
 * API routing to allow HTTP method POST
 */
app.post('/todos', authenticate, (request, response) => {
  var todo = new Todo({
    text: request.body.text,
    _creator: request.user._id
  });
  todo.save().then((doc) => {
    response.send(doc);
  }, (error) => {
    response.status(400).send(error);
  })
});

/**
 * API routing to allow HTTP method GET
 * Only returns todos of the user who requested it.
 */
app.get('/todos', authenticate, (request, response) => {
  Todo.find({
    _creator: request.user._id,
  }).then((todos) => {
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
app.get('/todos/:id', authenticate, (request, response) => {
  var todoId = request.params.id;

  if (!ObjectID.isValid(todoId)) {
    return response.status(404).send();
  }

  Todo.findOne({
    _id: todoId,
    _creator: request.user._id
  }).then((todo) => {
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
app.delete('/todos/:id', authenticate, async (request, response) => {
  var todoId = request.params.id;

  if (!ObjectID.isValid(todoId)) {
    return response.status(404).send();
  }

  try {
    const todo = await Todo.findOneAndRemove({
      _id: todoId,
      _creator: request.user._id
    });

    if (!todo) {
      return response.status(404).send();
    }
    response.send({
      todo
    });
  } catch (error) {
    response.status(400).send(error);
  }

});

/**
 * Method to update a todo item.
 * Receiving an ID and a body parameter, it allows an user to set a todo item
 * as completed (and updates the field completedAt) or change the todo text body.
 * It never allows the user to change the completedAt field.
 */
app.patch('/todos/:id', authenticate, (request, response) => {
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

  Todo.findOneAndUpdate({
    _id: id,
    _creator: request.user._id
  }, {
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
    response.status(404).send(error);
  })
});

// POST /users
app.post('/users', async (request, response) => {
  try {
    const body = await _.pick(request.body, ['email', 'password']);
    let user = await new User(body).save();
    const token = await user.generateAuthToken();
    response.header('x-auth', token).send({
      user
    });
  } catch (error) {
    response.status(400).send(error);
  }
});

/**
 * Method to allow users to login with the API
 */
app.post('/users/login', async (request, response) => {
  try {
    const credentials = _.pick(request.body, ['email', 'password']);
    const user = await User.findByCredentials(credentials.email, credentials.password);
    const token = await user.generateAuthToken();
    response.header('x-auth', token).send(user);

  } catch (error) {
    response.status(400).send(error);
  };
});

/**
 * App route to allow an user to delete a token - as in. logout from app.
 */
app.delete('/users/me/token', authenticate, async (request, response) => {
  try {
    await request.user.removeToken(request.token);
    response.status(200).send();
  } catch (error) {
    response.status(400).send(error);
  }
});


/**
 * Gets the user request for himself.
 */
app.get('/users/me', authenticate, (request, response) => {
  response.send(request.user);
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
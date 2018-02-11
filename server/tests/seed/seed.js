const jwt = require('jsonwebtoken');
const {
  ObjectID
} = require('mongodb')

const {
  Todo
} = require('./../../models/todo');

const {
  User
} = require('./../../models/user')

/**
 * Creates two mock users to allow GET and POST methods to be tested.
 */
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

/**
 * Creates two mock tasks to allow the GET /todos method to be tested.
 */
const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
  }
];



const users = [{
  _id: userOneId,
  email: 'oneValidEmail@domain.net',
  password: '123abc!',
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userOneId,
      access: 'auth'
    }, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'anotherValidEmail@domain.net',
  password: 'abc123!',
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userTwoId,
      access: 'auth'
    }, 'abc123').toString()
  }]
}];

/**
 * Method to populate the test database with two todo items to allow the testing
 * of all routes.
 */
const populateTodos = ((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

/**
 * Method to populate the test database with two users to allow the testing
 * of all routes.
 */
const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
}
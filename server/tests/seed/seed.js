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
 * Creates two mock tasks to allow the GET /todos method to be tested.
 */
const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
  }
];

/**
 * Creates two mock users to allow GET and POST methods to be tested.
 */
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

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
  password: 'abc123!'
}];

const populateTodos = ((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

const populateUsers = ((done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    Promise.all([userOne, userTwo]).then(() => {

    });
  }).then(() => done());
})

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
}
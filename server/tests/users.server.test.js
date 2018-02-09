/** 
 * Third party modules required for the test suite
 */
const expect = require('expect');
const request = require('supertest');
const {
  ObjectID
} = require('mongodb');

/**
 * Local modules required to this test suite.
 */
const {
  app
} = require('./../server');
const {
  User
} = require('./../models/user')
const {
  users, populateUsers 
} = require('./seed/seed');

beforeEach(populateUsers);

describe('/POST/users', () => {
  it('should allow creating a new user with a valid email and password', (done) => {
    var newUser = {
      email: 'aValidEmail@email.com',
      password: '123abc!'
    }
    request(app)
      .post('/users')
      .send(newUser)
      .expect(200)
      .end(done);
  });

  it('should break with an invalid email', (done) => {
    var newUser = {
      email: 'abc',
      password: 'doesntreallymatter'
    };
    request(app)
      .post('/users')
      .send(newUser)
      .expect(400)
      .end(done);
  });

  it('should not allow a duplicate email', (done) => {
    var repeatedEmail = users[0].email;
    var newUser = {
      repeatedEmail,
      password: '123abc!'
    };
    request(app)
      .post('/users')
      .send(newUser)
      .expect(400)
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should be able to get an user email after being created.', (done) => {
    var newUser = {
      email: 'abc@domain.etn',
      password: 'doesntreallymatter'
    };
    request(app)
      .post('/users')
      .send(newUser)
      .expect(200)
      .expect((response) => {
        expect(response.body.user.email).toBe(newUser.email);
      })
      .end(done);
  })
})
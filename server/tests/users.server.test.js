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
  users,
  populateUsers
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

describe('POST /users/login', () => {
  it('should logging user and return auth token.', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((response) => {
        expect(response.headers['x-auth']).toExist();
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: response.headers['x-auth']
          });
          done();
        }).catch((error) => done(error));
      });
  });

  it('should reject invalid login.', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: '12abc3'
      })
      .expect(400)
      .expect((response) => {
        expect(response.headers['x-auth']).toNotExist();
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((error) => done(error));
      });
  });
});
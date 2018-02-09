/** 
 * Third party modules required for the test suite
 */
const expect = require('expect');
const request = require('supertest');
const {
  ObjectID
} = require('mongodb');
const {
  app
} = require('./../server');

const {
  users,
  populateUsers
} = require('./seed/seed');

beforeEach(populateUsers);

describe('GET user by token', () => {
  it('should find an existing user by token.', (done) => {

    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((response) => {
        expect(response.body._id).toBe(users[0]._id.toHexString());
        expect(response.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should not find an user with random token.', (done) => {
    var randomToken = 'usersk'

    request(app)
      .get('/users/me')
      .set('x-auth', randomToken)
      .expect(401)
      .end(done);
  });

  it('should not retrieve anything if no token is passed', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((result) => {
        expect(result.body).toEqual({})
      })
      .end(done)
  })

});
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
  Todo
} = require('./../models/todo');
const {
  todos,
  populateTodos
} = require('./seed/seed');
const {
  users,
  populateUsers
} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({
          text
        }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  })

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.text).toBe()
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        });
      });
  });
});

describe('GET /todos tests', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      // Getting the id of the first todo item created
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200) // it should be possible to fetch this id
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not allow an user to get a todo from another user', (done) => {
    request(app)
      // Getting the id of the first todo item created
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404) // it should be possible to fetch this id
      .end(done);
  });

  it('should return 401 if todo id not found', (done) => {
    var aValidObjectID = new ObjectID();
    request(app)
      .get(`/todos/${aValidObjectID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 401 if ObjectID is not valid.', (done) => {
    var anInvalidObjectId = '123';
    request(app)
      .get(`/todos/${anInvalidObjectId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should be able to delete a todo item based on valid ID', (done) => {
    var hexId = todos[1]._id.toHexString()
    request(app)
      // Get the id the of the second item created in the list
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done());
      });
  });

  it('should not authorize an user to delete another\' todos', (done) => {
    var hexId = todos[1]._creator.toHexString(); // first todo creator's token
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toExist();
          done();
        }).catch((err) => done());
      });
  });

  it('should return a 404 if object ID does not exist in database', (done) => {
    var anotherValidObjectID = new ObjectID();
    request(app)
      .delete(`/todos/${anotherValidObjectID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if ID is not valid', (done) => {
    var anotherInvalidObjectId = '123';
    request(app)
      .delete(`/todos/${anotherInvalidObjectId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the text field of an item if id exists', (done) => {
    var hexId = todos[0]._id.toHexString();
    var newText = 'Some test changes';
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        "completed": true,
        "text": newText
      })
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
        expect(res.body.todo.text).toBe(newText);
      })
      .end(done);
  });

  it('should not update field of an item if user is not creator', (done) => {
      var hexId = todos[0]._id.toHexString();
      var newText = 'Some test changes';
      request(app)
        .patch(`/todos/${hexId}`)
        .send({
          "completed": true,
          "text": newText
        })
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });

  it('should set a task completed field to true and updated completedAt',
    (done) => {
      var hexId = todos[0]._id.toHexString();
      request(app)
        .patch(`/todos/${hexId}`)
        .send({
          "completed": true
        })
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo._id).toBe(hexId);
          expect(res.body.todo.completed).toBe(true);
          expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);
    });

  it('should be able to convert a completed task to not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        "completed": false
      })
      .expect(200)
      .set('x-auth', users[1].tokens[0].token)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
        // Another option to assert it is null.
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });

  it('should return not found if can\'t find id in the database', (done) => {
    var hexId = new ObjectID();
    var newText = "Some text that should **not** update";
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        "text": newText
      })
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 with invalid id', (done) => {
    var hexId = '123';
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: true
      })
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});
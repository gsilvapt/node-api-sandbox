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

/**
 * Creates two mock tasks to allow the GET /todos method to be tested.
 */
const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo'
  }
];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET/todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      // Getting the id of the first todo item created
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200) // it should be possible to fetch this id
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo id not found', (done) => {
    var aValidObjectID = new ObjectID();
    request(app)
      .get(`/todos/${aValidObjectID}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if ObjectID is not valid.', (done) => {
    var anInvalidObjectId = '123';
    request(app)
      .get(`/todos/${anInvalidObjectId}`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE/todos/:id', () => {
  it('should be able to delete a todo item based on valid ID', (done) => {
    var hexId = todos[1]._id.toHexString()
    request(app)
      // Get the id the of the second item created in the list
      .delete(`/todos/${hexId}`)
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

  it('should return a 404 if object ID does not exist in database', (done) => {
    var anotherValidObjectID = new ObjectID();
    request(app)
      .delete(`/todos/${anotherValidObjectID}`)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if ID is not valid', (done) => {
    var anotherInvalidObjectId = '123';
    request(app)
      .delete(`/todos/${anotherInvalidObjectId}`)
      .expect(404)
      .end(done);
  });
});
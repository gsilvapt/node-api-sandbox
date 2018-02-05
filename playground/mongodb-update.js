const {
  MongoClient,
  ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to database: ' + err);
  }
  console.log('Successfully connected to the database.');

  //findOneAndUpdate
  db.collection('Todos').findOneAndUpdate({
    text: 'Walk the dog'
  }, {
    $set: {
      completed: true
    }
  }, {
    $returnOriginal: false
  }).then((res) => {
    console.log(res);
  })

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID("5a783342f5ff0b1f81b8dd4c")
  }, {
    $set: {
      name: 'gsilvapt'
    },
    $inc: {
      age: 1
    }
  }, {
    $returnOriginal: false
  }).then((res) => {
    console.log(res);
  })

  // db.close();
});
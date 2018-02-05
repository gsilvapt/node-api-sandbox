const {
  MongoClient,
  ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to database: ' + err);
  }
  console.log('Successfully connected to the database.');

  // deleteMany
  // db.collection('Todos').deleteMany({
  //   text: 'eat lunch',
  // }).then((res) => {
  //   console.log(res);
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({
  //   text: 'eat lunch',
  // }).then((res) => {
  //   console.log(res);
  // })

  // findOneAndDelete
  db.collection('Todos').findOneAndDelete({
    completed: false
  }).then((res) => {
    console.log(res);
  });

  db.collection('Users').deleteMany({
    name: 'gsilvapt'
  }).then((res) => {
    console.log('Deleted documents with name gsilvapt')
  });

  db.collection('Users').findOneAndDelete({
    _id: new ObjectID("5a783e80f5ff0b1f81b8df16")
  }).then((res) => {
    console.log(res);
  })

  // db.close();
});
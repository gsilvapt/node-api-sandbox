//const MongoClient = require('mongodb').MongoClient;
const {
  MongoClient,
  ObjectID
} = require('mongodb'); // Both are similar

// var obj = new ObjectID();
// console.log(obj);

/**
 * Takes two arguments:
 * 1 - Where the database lives, which can be an amazon instance or the 
 * localhost.
 * 2 - A callback function to fire after the connection succeeded or failed.
 */
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {

    return console.log('Unable to connect to MongoDb server: ' + err);
  }
  console.log('Connected to MongoDB server. ');

  db.collection('Todos').find().count().then((count) => {
    console.log(`Todos count: ${count}`);
  }, (err) => {
    console.log('Unable to fetch data: ' + err);
  });

  // db.close(); // Closes the connection

});
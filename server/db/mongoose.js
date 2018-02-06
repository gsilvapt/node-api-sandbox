var mongoose = require('mongoose');

const REMOTE_MONGO = 'mongodb://<dbuser>:<dbpassword>@ds125288.mlab.com:25288/todo-api-sandbox';
const LOCAL_MONGO = 'mongodb://localhost:27017/TodoApp';
const MONGO_URI = process.env.PORT ? REMOTE_MONGO : LOCAL_MONGO;

mongoose.Promise = global.Promise; // Sets which Promise library to use
mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to Mongo Instance.');
}, (err) => {
  console.log('Error connecting to Mongo instance:', err);
});

module.exports = {
  mongoose
}
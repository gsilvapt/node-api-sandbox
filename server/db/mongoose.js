var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // Sets which Promise library to use
mongoose.connect('mongodb://localhost:27017/TodoApp'); // Connects to database

module.exports = {
  mongoose
}
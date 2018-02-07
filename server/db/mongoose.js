var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // Sets which Promise library to use
mongoose.connect(process.env.MONGOLAB_AMBER_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose
}
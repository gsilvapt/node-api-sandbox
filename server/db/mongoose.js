var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // Sets which Promise library to use
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost.27017/TodoApp');


module.exports = {
  mongoose
}
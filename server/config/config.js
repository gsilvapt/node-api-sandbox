var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  var config = require("./config.json");
  var envConfig = config[env];
  
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]
  });
} else if (env === 'test') {
  process.env.PORT = 3000;	
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
  process.env.JWT_SECRET = 'megaSecretKey';
}
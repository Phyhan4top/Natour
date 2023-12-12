const mongoose = require('mongoose');
const env = require('dotenv');

env.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCATCH EXCEPTIONAL, Shutting down');

  process.exit(1);
});
const App = require('./app');
// mongoose.set({strictQuery: true});

const url = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
const urlLocal = process.env.DATABASE_LOCAL;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then((con) => {
    console.log('connected to database');
  });
// .catch((err) => {
//   console.log(err.name);
//   console.log(err.message);
// });

console.log(App.get('env'));
// console.log(process.env.NODE_ENV)
//1)START SERVER

const port = Number(process.env.PORT);
const server = App.listen(port, () => {
  console.log('App is running on port', port);
});

///Handling global UNHANDLE REJECTION
process.on('unhandledRejection', (err) => {
  console.error(err.name, err.message);
  console.log('UNHANDLED REJECTION, Shutting down');

  // Gracefully shut down, close MongoDB connection, then exit
  server.close(() => {
    mongoose.connection.close(() => {
      process.exit(1);
    });
  });
});
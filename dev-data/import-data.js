const fs = require('fs');
const mongoose = require('mongoose');
const env = require('dotenv');
env.config({ path: `./config.env` });
const tourModel = require('../Model/tourModel');
const userModel = require('../Model/userModel');
const reviewModel = require('../Model/reviewModel');


const url = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
const urlLocal = process.env.DATABASE_LOCAL;

mongoose
  .connect(urlLocal, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then((con) => {
    console.log('connected to database');
  });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8'),
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'),
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8'),
);

const importTours = async () => {
  try {
    console.log('All tours imported');
    await userModel.create(users,{validateBeforeSave:false});
    await tourModel.create(tours);
    await reviewModel.create(reviews);
    mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
};
const deleteAllTour = async () => {
  try {
    console.log('All tours deleted');
    await tourModel.deleteMany({});
    await reviewModel.deleteMany({});
    await userModel.deleteMany({});
    mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
};

console.log(process.argv);

if (process.argv[2] === '--import') {
  importTours();
} else if (process.argv[2] === '--delete') {
  deleteAllTour();
}

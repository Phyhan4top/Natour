const mongoose = require('mongoose');
const slug = require('slugify');
const validator = require('validator');
const userModel = require('./userModel');
const Schema = {
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    minlength: [
      10,
      'A tour name most have more than or equal to 10 characters',
    ],
    maxlength: [
      40,
      'A tour name most have less than or equal to 40 characters',
    ],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    set: (val) => Math.round((val * 10) / 10),
  },

  ratingsQuantity: { type: Number, default: 0 },
  price: { type: Number, required: [true, 'A tour must have a price'] },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a diffculty prop'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message:
        'the difficulty must have the value of : easy,medium,or difficult',
    },
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a Group size'],
    min: [5, ' maxGroupSize ({VALUE}) is less than minimum allowed value (5)'],
    max: [
      30,
      ' maxGroupSize ({VALUE}) is greater than minimum allowed value (30)',
    ],
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a summary'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'A tour must have a description'],
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a imageCover'],
  },
  images: {
    type: [String],
  },
  startDates: {
    type: [Date],
  },
  secretTour: {
    type: Boolean,
    default: false,
  },
  priceDiscount: {
    type: Number,
    //ONLY WORK FOR THIS DOC WHEN CREATING
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: `The price discount ({VALUE}) most not be greater or equal to the price`,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startLocation: {
    //GeoSpartial Data
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],

  guide: [{ type: mongoose.ObjectId, ref: 'User' }],
};
const tourSchema = mongoose.Schema(Schema, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// tourSchema.index({price:1})
tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({startLocation: '2dsphere'})
//DOCUMENT MIDDLEWARE

tourSchema.pre('save', function (next) {
  this.name = slug(this.name,{lower:false,replace:'-'})
 
next()
})
//METHOD OF EMBBEDING DOC
tourSchema.pre('save',async function (next) {
  const guideTour = this.guide.map(async id => await userModel.findById(id))
  this.guide=await Promise.all(guideTour)
  
next()
})
tourSchema.pre(/^find/,async function (next) {
  this.populate({ path: 'guide', select: '-__v -passwordChangeAt ' });
next()
})
tourSchema.post('save', function (doc, next) {
  doc.duration=7


  next()
})

//QUERY MIDDLEWARE
// tourSchema.pr e('find', function () {
// this.find({secretTour:{$ne:true}})
// })
// tourSchema.pre('findOne', function () {
// this.find({secretTour:{$ne:true}})
// })
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })
  this.start=Date.now()
next()
})
tourSchema.post(/^find/, function (doc,next) {
  console.log('Query took',Date.now()-this.start)
  next()
})

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  // this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
  // console.log(this.pipeline())

  next()
})
tourSchema.virtual('duration-Weeks').get(function (){
  return this.duration / 7
});

tourSchema.virtual('reviews',{ref:'Review',foreignField:'tour',localField:'_id'})
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const Schema = {
  name: {
    type: String,
    required: [true, 'please tell us your name !!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'please provide your email !!'],
    unique: true,
    validate: [
      validator.isEmail,
      'please provide a valid email,e.g, Test@test.com',
    ],
    lower: true,
  },
  password: {
    type: String,
    required: [true, 'please provide your password !!'],
    minlength: 8,
    select:false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password !!'],
    validate: {
      validator: function (val) {
      return this.password === val;
      },
      message: "password didn't match with password provide, please try again",
    },
  },
  photo: {
    type: String,
  },
  passwordChange:Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default:'user'
  },
  resetToken: String,
  resetTokenExpiresIn:Date,
  active:{
    type: Boolean,
    default: true,
    select:false
  }
};

const userSchema = mongoose.Schema(Schema);

userSchema.pre('save', async function (next) {
  // ONLY IF THE PASSWORD IS NOT MODIFIED THIS FUNC WILL RUN
  if (!this.isModified('password')) {
  return next()
  }

  // HASH THE PASSWORD BEFORE IT PERSIST TO DB
  this.password = await bcrypt.hash(this.password, 13)
  

  //REMOVE THE PASSWORDCONFIRM FROM THE DB
  this.passwordConfirm = undefined
  return next()
})
userSchema.pre('save', async function (next) {
  // ONLY IF THE PASSWORD IS NOT MODIFIED THIS FUNC WILL RUN
  if (!this.isModified('password') || this.isNew) {
  return next()
  }
this.passwordChange=new Date()-1000
  
  return next()
})
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
    
next()
})
userSchema.methods.correctPassword = async function (
  inputPassword,
  userPassword,
) {
  return await bcrypt.compare(inputPassword,userPassword)
};
userSchema.methods.checkPassword = async function (
  inputPassword
) {
  return await bcrypt.compare(inputPassword,this.password)
};
userSchema.methods.passwordChangeAft = function (jwtTIMESTAMP) {
  if (this.passwordChange) {
    
  return jwtTIMESTAMP < parseInt(this.passwordChange.getTime() / 1000, 10);
  }
  return false
}

userSchema.methods.forgotPassword = function () {
  ///CREATE A RANDOM HEX DECIMAL STRING
  const resetToken= crypto.randomBytes(32).toString('hex')
  //HASH THE RESET TOKEN
  this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetTokenExpiresIn = Date.now() + 10 * 60 * 1000


return resetToken
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../userModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const Email = require('../../utils/Email');

const Token = (id) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES,
  });
  return token;
};
const sendToken = (user, statusCode, res) => {
  const token = Token(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.TOKEN_COOKIE_EXPIRES * 3600 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  user.password = undefined;
  user.active = undefined;
  res
    .cookie('jwt', token, cookieOptions)
    .status(statusCode)
    .json({
      status: 'success',
      token,
      data: {
        user: user,
      },
    });
};
exports.SignUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/user`;

  await new Email(newUser, url).sendWelcome();
  sendToken(newUser, 200, res);
});
exports.Login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('please provide your email or password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  sendToken(user, 200, res);
});
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      ///VERIFICATION OF THE TOKEN
      const verify = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // const verify = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      ///CHECK IF THE USER OF THE ID STILL EXIST
      const currentUser = await User.findById(verify.id);
      if (!currentUser) {
        return next();
      }

      ///CHECK IF THE USER CHANGE PASSWORD AFTER GETTING THE TOKEN
      if (currentUser.passwordChangeAft(verify.iat)) {
        return next();
      }
      req.user = currentUser;
      res.locals.user = currentUser;

      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.logoutAuth = catchAsync(async (req, res) => {
  res
    .cookie('jwt', 'logout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .status(200)
    .json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Access deny..Please login to continue!', 401));
  }

  ///VERIFICATION OF THE TOKEN
  // const verify=await promisify(jwt.verify)(token,process.env.JWT_SECRET)
  const verify = jwt.verify(token, process.env.JWT_SECRET);

  ///CHECK IF THE USER OF THE ID STILL EXIST
  const currentUser = await User.findById(verify.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        401,
      ),
    );
  }

  ///CHECK IF THE USER CHANGE PASSWORD AFTER GETTING THE TOKEN
  if (currentUser.passwordChangeAft(verify.iat)) {
    return next(
      new AppError(
        'User recently change password,please login again to continue',
        401,
      ),
    );
  }
  req.user = currentUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are no authorize to access this route', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Check if the email
  req.body.email.toLowerCase();
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Email provided did not exist ', 404));
  }

  /// GENERATE A RANDOM TOKEN
  const resetToken = user.forgotPassword();

  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetpassword/${resetToken}`;

    await new Email(user, resetUrl).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email ',
    });
  } catch (err) {
    user.resetToken = undefined;
    user.resetTokenExpiresIn = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending this email, try agein later.',
        500,
      ),
    );
  }
});
exports.passwordReset = catchAsync(async (req, res, next) => {
  //GET USER BASE ON THEIR TOKEN

  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetToken,
    resetTokenExpiresIn: { $gt: new Date() },
  });

  ///CHECK IF THE TOKEN HAS NOT EXPIRES
  if (!user) {
    return next(
      new AppError('Token is invalid or has expires, try again!', 400),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.resetTokenExpiresIn = undefined;
  await user.save();
  // UPDATE CHANGEPASSWORDAT PROPERTY

  //LOG THE USER IN ,SEND THE JWT
  sendToken(user, 200, res);
});

exports.UpdatePassword = catchAsync(async (req, res, next) => {
  // console.log(req.user)
  const user = await User.findOne({ _id: req.user._id }).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError(
        'Incorrect password...please enter the correct password to continue',
        401,
      ),
    );
  }

  //
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  // console.log(user)
  ///

  sendToken(user, 200, res);
});

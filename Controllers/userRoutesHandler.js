const multer = require('multer');
const sharp = require('sharp');
const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const { deleteReq, updateReq, getOneReq } = require('./handlerFactory');
const AppError = require('../utils/AppError');

const filterObj = (Obj, ...allowObj) => {
  const newObj = {};
  Object.keys(Obj).forEach((el) => {
    if (allowObj.includes(el)) {
      newObj[el] = Obj[el];
    }
  });
  return newObj;
};
const memoryStorage = multer.memoryStorage();

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'public/img/users'),
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     return cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
//
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }

  return cb(new AppError('please upload only image..and try again'), false);
};
const upload = multer({ storage: memoryStorage, fileFilter: multerFilter });
exports.uploadPhotoFile = upload.single('photo');
exports.photoResize = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  return next();
};
exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    result: users.length,
    body: { data: users },
  });
});

exports.filterBody = (req, res, next) => {
  const filter = filterObj(req.body, 'name', 'email');
  req.body = filter;
  next();
};
exports.updateCurrentUser = catchAsync(async (req, res) => {
  console.log(req.file);
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) {
    filterBody.photo = req.file.filename;
  }
  console.log(filterBody);
  const user = await User.findByIdAndUpdate({ _id: req.user._id }, filterBody, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({ status: 'success', body: { data: user } });
});

//CAN'T UPDATE THE USER PASSWORD AND ROLE
exports.updateUser = updateReq(User);
exports.deleteUser = deleteReq(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = getOneReq(User);

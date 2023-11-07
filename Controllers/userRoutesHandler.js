const User =require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const { deleteReq, updateReq,getOneReq } = require('./handlerFactory');


const filterObj = (Obj, ...allowObj) => {
  let newObj={}
 Object.keys(Obj).forEach(el => {
   if (allowObj.includes(el)) {
   newObj[el]=Obj[el]
   }

 })
     return newObj
}

exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    result: users.length,
    data: { users },
  });
});

exports.filterBody = (req, res, next) => {
  const filter = filterObj(req.body, 'name', 'email');
  req.body = filter
  
  next()
}
exports.updateCurrentUser = catchAsync(async (req, res) => {
  const filterBody = filterObj(req.body, 'name', 'email');

  const user = await User.findByIdAndUpdate({ _id: req.user._id }, filterBody, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({ status: 'success', body: { user } });
});

//CAN'T UPDATE THE USER PASSWORD AND ROLE
exports.updateUser=updateReq(User)
exports.deleteUser =deleteReq(User)
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}
exports.getUser=getOneReq(User)

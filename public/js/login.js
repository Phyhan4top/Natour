import axios from 'axios';
// const  axios = require('axios')
import { showAlert } from './Alert';

export const log = async (data, type) => {
  
  const url=type==='login'? `http://localhost:3000/api/v1/users/login`:`http://localhost:3000/api/v1/users/signup`;
  
 
  try {
    const res = await axios({
      method: 'POST',
      url: url,
      data: data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type} in Successfully`);

      setTimeout(() => location.assign('/'), 1500);
    }

    console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/users/logout`,
    });
    console.log(res);
    if (res.data.status === 'success') location.assign('/');
  } catch (err) {
    showAlert('error', 'something went wrong');
  }
};
export const changePassword = async (
  currentPassword,
  newPassword,
  newPasswordConfirm,
) => {
  const body = {
    currentPassword,
    newPassword,
    newPasswordConfirm,
  };
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/updatepassword`,
      data: body,
    });

    if (res.data.status === 'success') showAlert('success', 'Password changed');
  } catch (err) {
    console.log(err);
    showAlert('error', 'something went wrong');
  }
};
export const changeInfo = async (name, email) => {
  const body = {
    name,
    email,
  };
  try {
    const res = await axios.patch(
      `http://localhost:3000/api/v1/users/updateMe`,
      body,
    );

    if (res.data.status === 'success')
      showAlert('success', 'Updated successfully');
  } catch (err) {
    console.log(err);
    showAlert('error', 'something went wrong');
  }
};

export const updateSettings = async (data, type) => {
  try {
    let url =
      type === 'password'
        ? `http://localhost:3000/api/v1/users/updatepassword`
        : `http://localhost:3000/api/v1/users/updateMe`;

    const res = await axios.patch(url, data);
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

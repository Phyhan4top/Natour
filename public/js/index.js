import '@babel/polyfill';
import { logOut, log, updateSettings } from './login';
import { displayMap } from './mapBox';
import { BookTourCheckout } from './Booking';

// VALUES
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signUpForm = document.querySelector('.form.form--signup');
const logoutBtn = document.querySelector('.nav__el.nav__el--logout');
const changeCurrentPassword = document.getElementById('form-passwordchange');
const changeData = document.getElementById('form-datachange');
const BookTour = document.getElementById('checkout-button');

//DELEGATE

// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.location);

//   displayMap(locations);
// }

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('name-signup').value,
      email: document.getElementById('email-signup').value.toLowerCase(),
      password: document.getElementById('password-signup').value,
      passwordConfirm: document.getElementById('passwordConfirm-signup').value,
    };
   

    log(data, 'signup');
    console.log('submitted');
  });
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      email: document.getElementById('email').value.toLowerCase(),
      password: document.getElementById('password').value,
    };


    log(data, 'login');
    console.log('submitted');
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logOut);
}

if (changeCurrentPassword) {
  changeCurrentPassword.addEventListener('submit', (e) => {
    console.log('changePassword')
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    document.getElementById('change-password').textContent = 'Updating...';
    // changePassword(currentPassword, password, passwordConfirm);
    const data = {
      currentPassword: currentPassword,
      newPassword: password,
      newPasswordConfirm: passwordConfirm,
    };
    updateSettings(data, 'password');
    document.getElementById('change-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
if (changeData) {
  changeData.addEventListener('submit', (e) => {
    console.log('data-change')
    e.preventDefault();
    // console.log(document.getElementById('photo').files[0]);
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value.toLowerCase());
    form.append('photo', document.getElementById('photo').files[0]);
    document.getElementById('change-data').textContent = 'Updating';

    updateSettings(form,'data');

    document.getElementById('change-data').textContent == 'Save password';

    // changeInfo(name, email)
  });
}

if (BookTour) {
  BookTour.addEventListener('click', (e) => {
    e.preventDefault();
    const tourId = e.target.dataset.tourId;
    BookTourCheckout(tourId);
    console.log('clicked');
  });
}

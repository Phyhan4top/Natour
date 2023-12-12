import axios from 'axios';
import { showAlert } from './Alert';

const stripe = Stripe(
  'pk_test_51OEtEeCxK1g5E3uJd3nJBk6CR73duVq08RBgxLuEZxKFFNCZTg3MlL8PnNSQI5NGqZyYBkleYCJGQGEdgESagu4L00aqpCJwAy',
  { apiVersion: '2023-10-16' },
);

export const BookTourCheckout = async (tourId) => {

  const  url = `/api/v1/bookings/checkout-session/${tourId}`;
  
  try {
    const session = await axios.get(url);
    console.log(session);
    console.log(session.data.session.id);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

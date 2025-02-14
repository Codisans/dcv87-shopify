import {useRef, useState} from 'react';
import jsonp from '~/lib/jsonp';
import {Symbol} from './Symbol';
import {TransitionLink} from './TransitionLink';

export const MailchimpForm = ({successMessage}) => {
  const formRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const successMsg = successMessage || 'SUBSCRIBED.';

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }

    const url =
      'https://COM.us10.list-manage.com/subscribe/post?u=369f37ac9b2e248abdb43edfb&amp;id=a05aa6971c&amp;f_id=00f142e5f0';
    jsonp(`${url}&EMAIL=${email}`, {param: 'c'}, (_, data) => {
      const {msg, result} = data;

      switch (result) {
        case 'success':
          setSuccess(true);
          break;
        default:
          console.log('Mailchimp form error: ', msg);
          setError(msg);
          break;
      }
    });
  };

  return (
    <div className="w-full">
      {success ? (
        <div className="w-full flex flex-col gap-8">
          <p className="text-center text-h3 text-green">{successMsg}</p>
          <TransitionLink className="button w-full" to="/">
            GO HOME
          </TransitionLink>
        </div>
      ) : (
        <form
          className={`w-full flex flex-col gap-8 ${error ? 'error' : ''}`}
          onSubmit={onSubmit}
        >
          <div className="w-full error:ring-2 error:ring-red">
            <label className="sr-only" htmlFor="EMAIL">
              Email
            </label>
            <input
              className="w-full uppercase px-8 py-4 border-2 bg-black border-red error:ring-red focus:outline-none focus:ring-green focus:ring-2"
              type="email"
              name="EMAIL"
              placeholder="Email"
              required
              onChange={(e) => {
                setError(null);
                setEmail(e.target.value);
              }}
            ></input>
          </div>
          <button className="w-full button" type="submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

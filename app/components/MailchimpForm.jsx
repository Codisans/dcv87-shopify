import {useRef, useState} from 'react';
import jsonp from '~/lib/jsonp';

export const MailchimpForm = () => {
  const formRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }

    const url =
      'https://COM.us10.list-manage.com/subscribe/post?u=369f37ac9b2e248abdb43edfb&amp;id=a05aa6971c&amp;f_id=00f142e5f0';
    jsonp(`${url}&EMAIL=${email}`, {param: 'c'}, (_, data) => {
      console.log('data', data);
      const {msg} = data;

      alert(msg);
    });
  };

  return (
    <div className="w-full">
      <form
        className={`w-full flex flex-col ${error ? 'error' : ''}`}
        onSubmit={onSubmit}
      >
        <div className="w-full error:ring-2 error:ring-red">
          <label className="sr-only" htmlFor="EMAIL">
            Email
          </label>
          <input
            className="w-full uppercase px-8 py-4 border-2 bg-black border-red focus:outline-none focus:ring-green focus:ring-2"
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
        <button className="mt-8 w-full button" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

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
    <div>
      <form
        className={`flex flex-col ${error ? 'error' : ''}`}
        onSubmit={onSubmit}
      >
        <div className="error:ring-2 error:ring-offset-2 error:ring-red">
          <label className="sr-only" htmlFor="EMAIL">
            Email
          </label>
          <input
            className="w-full uppercase px-8 py-4 border-2 bg-black border-red focus:outline-none focus:ring-orange focus:ring-2"
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

  // return (
  //   <div id="mc_embed_shell">
  //     <div id="mc_embed_signup">
  //       <form
  //         ref={formRef}
  //         onSubmit={handleSubmit}
  //         action="https://COM.us10.list-manage.com/subscribe/post?u=369f37ac9b2e248abdb43edfb&amp;id=a05aa6971c&amp;f_id=00f142e5f0"
  //         method="post"
  //         id="mc-embedded-subscribe-form"
  //         name="mc-embedded-subscribe-form"
  //         className="validate"
  //       >
  //         <div className="flex flex-col gap-2" id="mc_embed_signup_scroll">
  //           <div className="mc-field-group flex flex-col gap-2 ring-red error:ring-2 error:ring-offset-2">
  //             <label className="sr-only" htmlFor="mce-EMAIL">
  //               Email Address <span className="asterisk">*</span>
  //             </label>
  //             <input
  //               type="text"
  //               name="EMAIL"
  //               className="required email w-full uppercase px-8 py-4 border-2 bg-black border-red focus:outline-none focus:ring-orange focus:ring-2"
  //               id="mce-EMAIL"
  //             />
  //             {error && (
  //               <div className="err">
  //                 <p>{JSON.stringify(error)}</p>
  //               </div>
  //             )}
  //           </div>

  //           <div
  //             aria-hidden="true"
  //             style={{position: 'absolute', left: '-5000px'}}
  //           >
  //             <input
  //               type="text"
  //               name="b_369f37ac9b2e248abdb43edfb_a05aa6971c"
  //               tabIndex="-1"
  //               defaultValue=""
  //             />
  //           </div>
  //           <div className="optionalParent">
  //             <button
  //               id="mc-embedded-subscribe"
  //               name="subscribe"
  //               value="Subscribe"
  //               type="submit"
  //               className="mt-8 w-full button"
  //             >
  //               Subscribe
  //             </button>
  //           </div>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );
};

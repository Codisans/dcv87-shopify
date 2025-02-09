import {Await} from '@remix-run/react';
import {Suspense} from 'react';

export const WeatherWidget = ({ip}) => {
  const location = fetch('https://ipapi.co/8.8.8.8/json/', {mode: 'no-cors'})
    .then(function (response) {
      response?.json()?.then((jsonData) => {
        console.log(jsonData);
      });
    })
    .catch(function (error) {
      console.log(error);
    });

  return (
    <div className="fixed left-4 bottom-20 z-50">
      <span>{ip}</span>
      <Suspense>
        <Await resolve={location}>
          {(loc) => {
            console.log(loc);
            return <div>{JSON.stringify(loc)}</div>;
          }}
        </Await>
      </Suspense>
    </div>
  );
};

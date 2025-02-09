import {Await} from '@remix-run/react';
import {Suspense} from 'react';

export const WeatherWidget = ({ip}) => {
  const location = fetch(`https://ipapi.co/${ip}/json/`, {mode: 'no-cors'})
    .then((res) => res.json())
    .catch((err) => console.log(err));

  return (
    <div className="fixed left-4 bottom-20 z-50">
      <span>{ip}</span>
      <Suspense>
        <Await resolve={location}>
          {(location) => <div>{JSON.stringify(location)}</div>}
        </Await>
      </Suspense>
    </div>
  );
};

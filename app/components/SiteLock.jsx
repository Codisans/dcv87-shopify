import {useLocation} from '@remix-run/react';
import {useEffect} from 'react';

export const SiteLock = ({env}) => {
  const {pathname} = useLocation();

  useEffect(() => {
    if (env.ENVIRONMENT !== 'production') return;

    if (pathname !== '/newsletter') {
      if (window.location.search === '?key=swid') {
        window.localStorage.setItem('key', 'swid');
      } else if (window.localStorage.getItem('key') !== 'swid') {
        console.log('redirecting');
        window.location.replace('/newsletter');
      }
    }
  }, [pathname]);
  return <></>;
};

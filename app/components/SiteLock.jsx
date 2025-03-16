import {useLocation} from '@remix-run/react';
import {useEffect} from 'react';
import {parseFields} from '~/utils/parseFields';

export const SiteLock = ({homePage, env}) => {
  const {pathname} = useLocation();
  const fields = parseFields(homePage.fields);
  const lockWebsite = fields.lock_website.value !== 'false';
  const accessKey = fields.access_key.value;

  useEffect(() => {
    if (!lockWebsite) return;

    if (pathname !== '/newsletter') {
      if (window.location.search === `?key=${accessKey}`) {
        window.localStorage.setItem('key', accessKey);
      } else if (window.localStorage.getItem('key') !== accessKey) {
        window.location.replace('/newsletter');
      }
    }
  }, [pathname]);
  return <></>;
};

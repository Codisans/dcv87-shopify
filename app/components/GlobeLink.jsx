import {Suspense} from 'react';
import {TransitionLink} from './TransitionLink';
import {Await} from '@remix-run/react';

export const GlobeLink = ({globeLinkMenu}) => {
  return (
    <div
      className={`fixed bottom-gutter right-gutter w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 z-header [clip-path:circle(36%)]`}
    >
      <img
        className="w-full h-full object-contain"
        src="/img/globe.gif"
        alt="DCV'87 Animated Logo"
      />
      <Suspense>
        <Await resolve={globeLinkMenu}>
          {(menu) => {
            const globeLink = menu?.menu?.items[0];
            if (!globeLink) return null;

            const globeLinkUrl =
              globeLink.url.includes('myshopify.com') ||
              globeLink.url.includes(publicStoreDomain) ||
              globeLink.url.includes(primaryDomainUrl)
                ? new URL(globeLink.url).pathname
                : globeLink.url;
            const isExternal = !globeLinkUrl.startsWith('/');

            return (
              <TransitionLink
                to={globeLinkUrl}
                className="absolute inset-0 z-10"
              >
                <span className="sr-only">{globeLink.title}</span>
              </TransitionLink>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
};

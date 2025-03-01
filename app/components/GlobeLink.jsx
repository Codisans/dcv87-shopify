import {Suspense} from 'react';
import {TransitionLink} from './TransitionLink';
import {Await} from '@remix-run/react';

export const GlobeLink = ({globeLinkMenu}) => {
  return (
    <div className="fixed bottom-gutter rounded-full right-gutter z-header shadow-glow hover:shadow-glow-lg transition-[box-shadow] duration-300 ease-in-out m-[1.15rem]">
      <div className="rounded-full overflow-hidden w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 [clip-path:circle(36%)] m-[-1.15rem]">
        <img
          className="w-full h-full object-contain"
          src="/img/globe.gif"
          alt="DCV'87 Animated Logo"
        />
        <Suspense>
          <Await resolve={globeLinkMenu}>
            {(menu) => {
              if (menu?.menu?.items.length == 0) return;

              const globeLink = menu?.menu?.items[0];

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
                  className="absolute inset-0 z-header"
                >
                  <span className="sr-only">{globeLink.title}</span>
                </TransitionLink>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
};

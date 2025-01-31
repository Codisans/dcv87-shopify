import {Await, Link, useLocation} from '@remix-run/react';
import {Suspense, useEffect, useId} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {MobileMenuAside} from '~/components/MobileMenuAside';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {LenisScroll} from './LenisScroll';
import {CartAside} from './CartAside';
import {HomeFooter} from './HomeFooter';
import {HomeHeader} from './HomeHeader';
import {AnimatePresence} from 'motion/react';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}) {
  const {pathname} = useLocation();
  const isHome = pathname == '/';

  if (isHome) {
    return (
      <div className="flex flex-col justify-center min-h-svh">
        {header && (
          <HomeHeader
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}

        <main>
          <AnimatePresence>{children}</AnimatePresence>
        </main>
        {footer && (
          <HomeFooter
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>
        <AnimatePresence>{children}</AnimatePresence>
      </main>
      {footer && (
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      )}
    </>
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */

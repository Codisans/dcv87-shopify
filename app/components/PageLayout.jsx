import {useLocation} from '@remix-run/react';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {HomeFooter} from './HomeFooter';
import {HomeHeader} from './HomeHeader';
import {TransitionProvider, useTransitionContext} from './TransitionContext';
import {useEffect, useRef} from 'react';

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
  const {containerRef, setTransitionContainer} = useTransitionContext();
  const transitionContainerRef = useRef(null);
  const isHome = pathname == '/';

  // useEffect(() => {
  //   if (containerRef.current || !transitionContainerRef.current) return;
  //   containerRef.current = transitionContainerRef.current;
  //   console.log('containerRef', containerRef.current);
  // }, [transitionContainerRef]);

  useEffect(() => {
    if (!transitionContainerRef.current) return;
    setTransitionContainer(transitionContainerRef.current);
  }, [transitionContainerRef]);

  return (
    <div className={isHome ? 'flex flex-col justify-center min-h-svh' : ''}>
      {header && !isHome && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <div className="opacity-0" ref={transitionContainerRef}>
        {isHome && header && (
          <HomeHeader
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}
        {children}
        {footer && isHome && (
          <HomeFooter
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}
      </div>
      {footer && !isHome && (
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      )}
    </div>
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

import {Suspense} from 'react';
import {
  Await,
  Link,
  NavLink,
  useAsyncValue,
  useLocation,
  useNavigate,
} from '@remix-run/react';
import {Image, useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {Symbol} from './Symbol';
import {CartLink} from './CartLink';
import {BackButton} from './BackButton';
import {TransitionLink} from './TransitionLink';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const {pathname} = useLocation();
  const showCart = !pathname.includes('/newsletter');
  const showMenu = !pathname.includes('/newsletter');

  return (
    <header className="fixed inset-0 w-full z-[60] pointer-events-none overlay-backdrop">
      <TransitionLink
        className="absolute top-gutter md:top-8 left-1/2 -translate-x-1/2 pointer-events-auto"
        prefetch="intent"
        to="/"
        end
      >
        <span className="sr-only">{shop.name}</span>
        <Symbol
          className="w-[9.25rem] h-[3.7rem] sm:w-[12rem] sm:h-[4.5rem] md:w-[16.375rem] md:h-[5.125rem] lg:w-[21rem] lg:h-[7rem] text-red"
          name="logo"
        />
      </TransitionLink>

      {showCart && (
        <CartLink
          className="absolute top-gutter md:mt-3 lg:mt-5 md:top-8 right-gutter pointer-events-auto"
          cart={cart}
        />
      )}

      {showMenu && (
        <HeaderMenu
          menu={menu}
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      )}
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  const {pathname} = useLocation();
  const showBackButton = !['/collections', '/blog'].includes(pathname);

  return (
    <nav
      className="absolute top-0 left-0 px-gutter pt-5 sm:pt-8 md:pt-12"
      role="navigation"
    >
      <ul className="flex flex-col items-start pointer-events-auto text-nav overlay-trigger">
        {showBackButton ? (
          <BackButton />
        ) : (
          (menu || FALLBACK_HEADER_MENU).items.map((item) => {
            if (!item.url || item?.url.endsWith('/cart')) return null;

            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
              item.url.includes(publicStoreDomain) ||
              item.url.includes(primaryDomainUrl)
                ? new URL(item.url).pathname
                : item.url;
            const isExternal = !url.startsWith('/');

            return (
              <li key={item.id} className="pb-0.5 last:pb-0">
                {isExternal ? (
                  <a
                    className="clip-hover"
                    href={url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.title}
                  </a>
                ) : (
                  <TransitionLink
                    className="clip-hover"
                    end
                    prefetch="intent"
                    to={url}
                  >
                    {item.title}
                  </TransitionLink>
                )}
              </li>
            );
          })
        )}
      </ul>
    </nav>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'SHOP',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'BLOG',
      type: 'HTTP',
      url: '/blogs',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'CART',
      type: 'PAGE',
      url: '/cart',
      items: [],
    },
  ],
};

/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */

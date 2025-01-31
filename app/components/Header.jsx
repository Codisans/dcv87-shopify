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

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;

  return (
    <header className="fixed inset-0 w-full z-[60] pointer-events-none overlay-backdrop">
      <NavLink
        className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto"
        prefetch="intent"
        to="/"
        end
      >
        <span className="sr-only">{shop.name}</span>
        <Symbol className="w-[16.375rem] h-[5.125rem] text-red" name="logo" />
      </NavLink>
      <CartLink
        className="absolute top-5 right-8 pointer-events-auto"
        cart={cart}
      />
      <HeaderMenu
        menu={menu}
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
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
  const showBackButton = pathname != '/collections';

  return (
    <nav
      className="absolute top-0 left-0 p-4 flex flex-col items-start text-h2 pointer-events-auto overlay-trigger"
      role="navigation"
    >
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
          return (
            <NavLink
              className="clip-hover"
              end
              key={item.id}
              prefetch="intent"
              to={url}
            >
              {item.title}
            </NavLink>
          );
        })
      )}
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

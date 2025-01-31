import {Suspense} from 'react';
import {
  Await,
  Link,
  NavLink,
  useAsyncValue,
  useLocation,
} from '@remix-run/react';
import {Image, useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {Symbol} from './Symbol';
import {CartLink} from './CartLink';

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
        <Image
          className="w-40 h-20"
          src="/img/dcv-logo.png"
          width={240}
          height={120}
          alt="DCV Logo"
        />
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
  return (
    <nav
      className="absolute top-0 left-0 p-4 flex flex-col items-start text-h2 pointer-events-auto overlay-trigger"
      role="navigation"
    >
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
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
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      {/* <HeaderMenuMobileToggle /> */}
      {/* <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink> */}
      {/* <CartToggle cart={cart} /> */}
    </nav>
  );
}

// function HeaderMenuMobileToggle() {
//   const {open} = useAside();
//   return (
//     <button
//       className="header-menu-mobile-toggle reset"
//       onClick={() => open('mobile')}
//     >
//       <h3>☰</h3>
//     </button>
//   );
// }

// function SearchToggle() {
//   const {open} = useAside();
//   return (
//     <button className="reset" onClick={() => open('search')}>
//       Search
//     </button>
//   );
// }

// /**
//  * @param {{count: number | null}}
//  */
// function CartBadge({count}) {
//   const {open} = useAside();
//   const {publish, shop, cart, prevCart} = useAnalytics();

//   return (
//     <a
//       href="/cart"
//       onClick={(e) => {
//         e.preventDefault();
//         open('cart');
//         publish('cart_viewed', {
//           cart,
//           prevCart,
//           shop,
//           url: window.location.href || '',
//         });
//       }}
//     >
//       Cart {count === null ? <span>&nbsp;</span> : count}
//     </a>
//   );
// }

// /**
//  * @param {Pick<HeaderProps, 'cart'>}
//  */
// function CartToggle({cart}) {
//   return (
//     <Suspense fallback={<CartBadge count={null} />}>
//       <Await resolve={cart}>
//         <CartBanner />
//       </Await>
//     </Suspense>
//   );
// }

// function CartBanner() {
//   const originalCart = useAsyncValue();
//   const cart = useOptimisticCart(originalCart);
//   return <CartBadge count={cart?.totalQuantity ?? 0} />;
// }

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

// /**
//  * @param {{
//  *   isActive: boolean;
//  *   isPending: boolean;
//  * }}
//  */
// function activeLinkStyle({isActive, isPending}) {
//   return {
//     fontWeight: isActive ? 'bold' : undefined,
//     color: isPending ? 'grey' : 'black',
//   };
// }

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */

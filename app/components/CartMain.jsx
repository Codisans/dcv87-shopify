import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {CartLines} from './CartLines';
import {TransitionLink} from './TransitionLink';

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({cart: originalCart}) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity > 0;

  return (
    <div className="w-full flex flex-col">
      <CartEmpty hidden={linesCount} />
      <div aria-labelledby="cart-lines">
        <ul className="w-full">
          {(cart?.lines?.nodes ?? []).map((line) => (
            <CartLineItem key={line.id} line={line} />
          ))}
        </ul>
      </div>
      {cartHasItems && <CartSummary cart={cart} />}
    </div>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 * }}
 */
function CartEmpty({hidden = false}) {
  return (
    <div hidden={hidden}>
      <div className="flex flex-col items-center gap-8 w-full border-t border-white">
        <p className="pt-32 lg:pt-40 pb-16 lg:pb-20 text-h3 max-w-md text-center">
          Add items to cart
        </p>
        <TransitionLink
          className="button max-w-full w-[280px]"
          to="/collections"
          prefetch="viewport"
        >
          Go to shop
        </TransitionLink>
      </div>
    </div>
  );
}

/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */

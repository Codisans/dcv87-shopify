import {Await} from '@remix-run/react';
import {Symbol} from './Symbol';
import {Suspense} from 'react';
import {TransitionLink} from './TransitionLink';

export function CartLink({cart, className = 'relative'}) {
  return (
    <TransitionLink
      className={`p-3 overlay-trigger [--clip-value:100%] active:[--clip-value:0] hover:[--clip-value:0] ${className}`}
      to="/cart"
    >
      <span className="sr-only">Cart </span>

      <Symbol className="w-10 h-10 group-hover/cart:fill-current" name="cart" />
      <span className="absolute top-[-0.2rem] right-[-0.2rem] rounded-full size-8 flex items-center justify-center bg-red text-white text-h4">
        <Suspense fallback={<span>0</span>}>
          <Await resolve={cart}>
            {(c) => <span>{c?.totalQuantity || 0}</span>}
          </Await>
        </Suspense>
      </span>
    </TransitionLink>
  );
}

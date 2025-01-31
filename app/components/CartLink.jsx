import {Await, Link} from '@remix-run/react';
import {Symbol} from './Symbol';
import {Suspense, useEffect} from 'react';

export function CartLink({cart, className = 'relative'}) {
  useEffect(() => {
    console.log(cart);
  }, [cart]);

  return (
    <Link className={`p-3 ${className}`} to="/cart">
      <span className="sr-only">Cart </span>
      <Symbol className="w-10 h-10" name="cart" />
      <span className="absolute top-[-0.2rem] right-[-0.2rem] rounded-full size-8 flex items-center justify-center bg-red text-white text-h4">
        <Suspense fallback={<span>0</span>}>
          <Await resolve={cart}>{(c) => <span>{c?.totalQuantity}</span>}</Await>
        </Suspense>
      </span>
    </Link>
  );
}

import {Link} from '@remix-run/react';
import {Symbol} from './Symbol';

export const CartLink = ({cart}) => {
  return (
    <Link className="relative" to="/cart">
      <span className="sr-only">Cart</span>
      <Symbol className="w-10 h-10" name="cart" />
      <span className="absolute top-0 right-0 rounded-full bg-red text-white text-h4">
        {cart?.lines?.nodes?.length || 0}
      </span>
    </Link>
  );
};

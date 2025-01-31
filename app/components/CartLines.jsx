import {CartLineItem} from './CartLineItem';

export const CartLines = ({cart}) => {
  return (
    <div aria-labelledby="cart-lines">
      <ul>
        {(cart?.lines?.nodes ?? []).map((line) => (
          <CartLineItem key={line.id} line={line} />
        ))}
      </ul>
    </div>
  );
};

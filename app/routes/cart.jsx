import {useLoaderData} from '@remix-run/react';
import {CartForm, Image} from '@shopify/hydrogen';
import {defer, json} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import {CartSummary} from '~/components/CartSummary';
import {PageTransition} from '~/components/PageTransition';
import {parseFields} from '~/utils/parseFields';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `DCV'87 | Cart`}];
};

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return json(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData, env: args.context.env});
}

/**
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {cart} = context;

  const [{metaobjects}] = await Promise.all([
    context.storefront.query(CART_PAGE_QUERY),
  ]);

  return {
    cart: await cart.get(),
    pageData: metaobjects.nodes[0],
  };
}

/**
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Cart() {
  /** @type {LoaderReturnData} */
  const {cart, pageData} = useLoaderData();
  const fields = parseFields(pageData.fields);

  return (
    <PageTransition>
      <h1 className="fixed top-28 left-1/2 -translate-x-1/2 text-h3 uppercase text-red z-10">
        Cart
      </h1>
      <Image
        className="fixed inset-0 w-full h-full object-cover"
        loading="eager"
        src={fields?.background?.reference?.image?.url}
        alt={fields?.background?.reference?.image?.altText}
      />
      <div className="container grid-layout relative z-10 pt-40 pb-20">
        <div className="col-start-3 col-end-11">
          <CartMain cart={cart} />
        </div>
      </div>
    </PageTransition>
  );
}

const CART_PAGE_QUERY = `#graphql 
  query CartPage {  
    metaobjects(type: "cart_page" first: 1) {
      nodes {
        seo {
          title {
            value
          }
          description {
            value
          }
        }
        fields {
          key
          reference {
              ... on MediaImage {
                image {
                  url
                }
              }
            }
        }
      }
    }
  }
`;

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */

import {Await, useLoaderData} from '@remix-run/react';
import {CartForm, Image} from '@shopify/hydrogen';
import {defer, json} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {BackgroundMedia} from '~/components/BackgroundMedia';
import {CartMain} from '~/components/CartMain';
import {CartSummary} from '~/components/CartSummary';
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

  console.log(fields.background);

  return (
    <main className="min-h-svh">
      <BackgroundMedia loading="eager" media={fields?.background?.reference} />

      <div className="container grid-layout relative z-10 pt-48 pb-24">
        <div className="col-start-1 col-end-13 sm:col-start-2 sm:col-end-12 lg:col-start-3 lg:col-end-11">
          <div className="-sm:px-gutter flex flex-row items-end justify-between gap-grid pb-4">
            <h1 className="text-h2 uppercase text-red">Cart</h1>
            <Suspense fallback={<span>0</span>}>
              <Await resolve={cart}>
                {(c) => (
                  <span className="text-h3 uppercase">
                    {c?.totalQuantity || 0}
                    &nbsp;
                    {c?.totalQuantity === 1 ? 'item' : 'items'}
                  </span>
                )}
              </Await>
            </Suspense>
          </div>

          <CartMain cart={cart} />
        </div>
      </div>
    </main>
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
            __typename
            ... on Video {
              mediaContentType
              previewImage {
                height
                width
                url
                altText
              }
              sources {
                url
                mimeType
                height
                width
                
              }
            }
            ... on MediaImage {
              image {
                url
                width
                height
                altText
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

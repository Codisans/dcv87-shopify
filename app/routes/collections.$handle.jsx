import {defer, redirect} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Link,
  PrefetchPageLinks,
  useNavigate,
  useLocation,
} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {parseFields} from '~/utils/parseFields';
import {useCallback, useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {BackgroundMedia} from '~/components/BackgroundMedia';
import {ShopifyMedia} from '~/components/ShopifyMedia';
import {ProductImage} from '~/components/ProductImage';
import {ProductCarousel} from '~/components/ProductCarousel';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `DCV'87 | ${data?.collection?.title || 'Shop'}`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 32,
  });

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();
  const background = collection?.metafield?.reference;
  const products = collection.products.nodes;
  const [displayCarousel, setDisplayCarousel] = useState(false);
  const {pathname} = useLocation();

  useEffect(() => {
    setDisplayCarousel(false);
    setTimeout(() => {
      setDisplayCarousel(true);
    }, 500);
  }, [pathname]);

  return (
    <main className="select-none">
      <h1 className="sr-only">{collection.title}</h1>
      <div className="sticky top-0 inset-x-0 min-h-svh h-svh overflow-hidden clip-inset-0 mb-[-100svh]">
        <ShopifyMedia
          className="w-full h-svh object-cover"
          loading="eager"
          media={background}
        />
        {products.map((product, index) => (
          <ShopifyMedia
            key={`${product.handle}-media`}
            id={`${product.handle}-media`}
            className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300 object-cover"
            loading="lazy"
            media={product?.metafield?.reference}
          />
        ))}
      </div>

      {displayCarousel && products?.length && (
        <ProductCarousel products={products} />
      )}

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </main>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    metafield(namespace: "custom" key: "background") {
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
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      metafield(namespace: "custom" key: "background") {
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
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

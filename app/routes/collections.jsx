import {defer, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PageTransition} from '~/components/PageTransition';
import {parseFields} from '~/utils/parseFields';
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import gsap from 'gsap';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [{title: `DCV'87 | Shop`}];
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
async function loadCriticalData({context, request}) {
  const handle = 'live';
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });

  const [{collection}, {metaobjects}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
    context.storefront.query(SHOP_PAGE_QUERY),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collection,
    metaobjects,
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
  const {collection, metaobjects} = useLoaderData();
  const pageData = metaobjects?.nodes[0];
  const fields = parseFields(pageData?.fields);

  const groupRef = useRef(null);
  const itemsArrayRef = useRef([]);
  const [tickerDimensions, setTickerDimensions] = useState(null);

  const addItemRef = useCallback((node) => {
    if (node && !itemsArrayRef.current.includes(node)) {
      itemsArrayRef.current.push(node);
    }
  }, []);

  const getTickerDimensions = () => {
    const visibleWidth = groupRef.current?.clientWidth;
    const itemWidth = itemsArrayRef.current[0]?.clientWidth;
    const totalWidth = itemWidth * itemsArrayRef.current.length;
    const extraWidth = visibleWidth + Math.max(visibleWidth - totalWidth, 0);
    const extraItems = Math.ceil(extraWidth / itemWidth);
    return {
      visibleWidth,
      itemWidth,
      totalWidth,
      extraWidth,
      extraItems,
    };
  };

  useEffect(() => {
    if (!groupRef.current || !itemsArrayRef.current.length) {
      return;
    }

    setTickerDimensions(getTickerDimensions());
    const resizeObserver = new ResizeObserver(() => {
      setTickerDimensions(getTickerDimensions());
    });
    resizeObserver.observe(groupRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!tickerDimensions) {
      return;
    }

    const {totalWidth} = tickerDimensions;

    const tween = gsap.to(groupRef.current, {
      translateX: `-=${totalWidth}`,
      duration: totalWidth / 75,
      ease: 'none',
      repeat: -1,
      onReverseComplete: () => {
        tween.totalTime(tween.totalTime() + tween.duration() * 100, true);
      },
    });

    return () => {
      if (groupRef.current) {
        gsap.set(groupRef.current, {clearProps: 'all'});
      }
      tween?.kill();
    };
  }, [tickerDimensions]);

  const products = collection.products.nodes;

  return (
    <PageTransition className="min-h-svh flex flex-col justify-center">
      <h1 className="fixed top-28 left-1/2 -translate-x-1/2 text-h3 uppercase text-red">
        Shop
      </h1>
      <Image
        className="fixed inset-0 w-full h-full object-cover"
        loading="eager"
        width={fields?.background?.reference?.image?.width}
        height={fields?.background?.reference?.image?.height}
        src={fields?.background?.reference?.image?.url}
        alt={fields?.background?.reference?.image?.altText}
      />

      {products.map((product, index) => (
        <Image
          key={`${product.handle}-image`}
          id={`${product.handle}-image`}
          className="fixed inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300"
          loading="lazy"
          width={product.metafield?.reference?.image?.width}
          height={product.metafield?.reference?.image?.height}
          src={product.metafield?.reference?.image?.url}
          alt={product.metafield?.reference?.image?.altText}
        />
      ))}

      <div className="py-40 relative z-10">
        <div className="w-full overflow-hidden">
          <ul ref={groupRef} className="flex w-full items-center">
            {products?.map((product, i) => (
              <li ref={addItemRef} key={i} className="flex-none pr-16 lg:pr-36">
                <ProductItem
                  product={product}
                  loading={i < 8 ? 'eager' : undefined}
                />
              </li>
            ))}
            {Array.from(
              {length: tickerDimensions?.extraItems || 0},
              (_, index) => products[index % products.length],
            )?.map((product, i) => (
              <li key={`${i}-extra`} className="flex-none pr-16 lg:pr-36">
                <ProductItem product={product} loading={'lazy'} />
              </li>
            ))}
          </ul>
        </div>
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      </div>
    </PageTransition>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!product || imageRef.current) return;

    imageRef.current = document.getElementById(`${product.handle}-image`);
  }, [product]);

  return (
    <div
      key={product.id}
      onMouseEnter={() => imageRef.current.classList.add('!opacity-100')}
      onMouseLeave={() => imageRef.current.classList.remove('!opacity-100')}
      className="relative p-12"
    >
      {product.featuredImage && (
        <Image
          className="w-80 h-80 object-contain"
          width={product.featuredImage.width}
          height={product.featuredImage.height}
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <Link
        className="absolute inset-0"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        <h4 className="sr-only">{product.title}</h4>
      </Link>
    </div>
  );
}

const SHOP_PAGE_QUERY = `#graphql 
  query ShopPage {  
    metaobjects(type: "shop_page" first: 1) {
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
          value
          reference {
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

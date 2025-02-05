import {defer, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link, PrefetchPageLinks} from '@remix-run/react';
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

  const dragInterfaceRef = useRef(null);
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

  let prevX = null;

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
      duration: totalWidth / 180,
      ease: 'none',
      repeat: -1,
      onReverseComplete: () => {
        tween.totalTime(tween.totalTime() + tween.duration() * 100, true);
      },
    });

    const updateTween = (delta) => {
      const velocity = Math.abs(delta);

      if (velocity === 0) {
        return;
      }

      const direction = delta < 0 ? 1 : -1;

      if (velocity > 0) {
        gsap.to(tween, {
          timeScale: velocity * direction * 1.4,
        });
      }

      gsap.to(tween, {
        timeScale: direction,
      });
    };

    const handleDrag = (e, x) => {
      if (x == 0) return;
      if (!prevX) {
        prevX = x;
        return;
      }
      updateTween(x - prevX);
      prevX = x;
    };
    const handleDragEnd = () => {
      prevX = null;
    };
    const handleTouchMove = (e) => {
      handleDrag(e, e.touches[0]?.clientX);
    };
    const handleMouseDrag = (e) => {
      handleDrag(e, e.pageX);
    };

    dragInterfaceRef.current?.addEventListener('drag', handleMouseDrag, {
      passive: true,
    });
    dragInterfaceRef.current?.addEventListener('touchmove', handleTouchMove, {
      passive: true,
    });
    dragInterfaceRef.current?.addEventListener('dragend', handleDragEnd, {
      passive: true,
    });
    dragInterfaceRef.current?.addEventListener('touchend', handleDragEnd, {
      passive: true,
    });

    return () => {
      if (groupRef.current) {
        gsap.set(groupRef.current, {clearProps: 'all'});
      }

      tween?.kill();
      dragInterfaceRef.current?.removeEventListener('drag', handleMouseDrag);
      dragInterfaceRef.current?.removeEventListener(
        'touchmove',
        handleTouchMove,
      );
      dragInterfaceRef.current?.removeEventListener('dragend', handleDragEnd);
      dragInterfaceRef.current?.removeEventListener('touchend', handleDragEnd);
    };
  }, [tickerDimensions]);

  const products = collection.products.nodes;

  return (
    <main ref={dragInterfaceRef} className="select-none">
      <h1 className="sr-only">Shop</h1>
      <div className="sticky top-0 inset-x-0 min-h-svh h-svh overflow-hidden clip-inset-0 mb-[-100svh]">
        <ShopifyMedia
          className="w-full h-svh object-cover"
          loading="eager"
          media={fields?.background?.reference}
        />
        {products.map((product, index) => (
          <ShopifyMedia
            key={`${product.handle}-media`}
            id={`${product.handle}-media`}
            className="absolute inset-0 w-full h-full touch:hidden opacity-0 transition-opacity duration-300 object-cover"
            loading="lazy"
            media={product?.metafield?.reference}
          />
        ))}
      </div>

      <div
        ref={dragInterfaceRef}
        className="relative h-svh z-10 flex flex-col justify-center py-12 lg:py-20"
      >
        <div className="w-full overflow-hidden">
          <ul ref={groupRef} className="flex w-full items-center">
            {products?.map((product, i) => (
              <li ref={addItemRef} key={i} className="flex-none">
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
              <li key={`${i}-extra`} className="flex-none">
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
    </main>
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
  const mediaRef = useRef(null);

  useEffect(() => {
    if (!product || mediaRef.current) return;

    mediaRef.current = document.getElementById(`${product.handle}-media`);
  }, [product]);

  return (
    <div
      key={product.id}
      onMouseEnter={() => mediaRef.current?.classList.add('!opacity-100')}
      onMouseLeave={() => mediaRef.current?.classList.remove('!opacity-100')}
      className="relative"
    >
      {product.featuredImage && (
        <ProductImage
          className="w-80 h-80 sm:h-96 sm:w-96 lg:w-120 lg:h-120 object-contain pointer-events-none"
          image={product.featuredImage}
          sizes="(min-width: 45em) 400px, 80vw"
          loading={loading}
          aspectRatio="1/1"
        />
      )}
      <Link
        className="absolute inset-0"
        key={product.id}
        prefetch="viewport"
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

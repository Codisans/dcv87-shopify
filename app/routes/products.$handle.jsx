import {defer} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Image,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {Symbol} from '~/components/Symbol';
import {Swiper, SwiperSlide} from 'swiper/react';
import {useEffect, useRef} from 'react';
import {Navigation} from 'swiper/modules';
import {ProductColors} from '~/components/ProductColors';
import {BackgroundMedia} from '~/components/BackgroundMedia';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `DCV'87 | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
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

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();
  const nextRef = useRef(null);
  const prevRef = useRef(null);

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  useEffect(() => {
    console.log(product, productOptions);
  }, [product]);

  return (
    <main className="min-h-lvh">
      <BackgroundMedia
        loading="eager"
        image={product?.metafield?.reference?.image}
      />
      <div className="min-h-svh pt-48 pb-24 flex flex-col justify-center items-center gap-y-12 relative z-10 container bg-black/20">
        <div className="relative px-20 sm:px-32">
          <Swiper
            className="w-full max-w-[56vw] sm:max-w-[min(30vw,32rem)]"
            modules={[Navigation]}
            speed={0}
            slidesPerView={1}
            navigation={{
              nextEl: nextRef.current,
              prevEl: prevRef.current,
            }}
          >
            <SwiperSlide>
              <ProductImage image={selectedVariant?.image} />
            </SwiperSlide>
          </Swiper>
          <button
            ref={prevRef}
            className="absolute top-1/2 left-0 -translate-y-1/2"
          >
            <Symbol
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 -scale-x-100"
              name="hand-pointer"
            />
          </button>
          <button
            ref={nextRef}
            className="absolute top-1/2 right-0 -translate-y-1/2"
          >
            <Symbol
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
              name="hand-pointer"
            />
          </button>
        </div>

        <div className="max-w-md flex flex-col gap-2">
          <h1 className="text-h3 text-red">{title}</h1>
          <ProductPrice
            className="text-h3"
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <div
            className="mb-8 rich-text"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
          <div className="md:hidden">
            <ProductColors
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </div>
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
        </div>
      </div>
      <div className="-md:hidden fixed left-gutter top-48 lg:top-auto lg:bottom-20 z-10">
        <ProductColors
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </main>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    metafield(namespace: "custom" key: "carousel_media") {
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
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
              width
              height
              altText
            }
          }

        }
      }
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
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

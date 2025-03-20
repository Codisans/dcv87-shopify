import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, IMAGE_FRAGMENT, Money} from '@shopify/hydrogen';
import {parseFields} from '~/utils/parseFields';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: "DCV'87 | Home"}];
};

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
  const [{metaobjects}] = await Promise.all([
    context.storefront.query(HOME_PAGE_QUERY),
  ]);

  return {
    pageData: metaobjects.nodes[0],
  };
}

/**
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const {pageData, env} = useLoaderData();

  const fields = parseFields(pageData.fields);

  return (
    <main className="max-h-[calc(100svh-(2*var(--home-header-height)))] w-full text-nav">
      <h1 className="sr-only">DCV'87</h1>
      <Image
        className="w-full max-h-full object-contain"
        width={fields?.background?.reference?.image?.width}
        height={fields?.background?.reference?.image?.height}
        src={fields?.background?.reference?.image?.url}
        alt={fields?.background?.reference?.image?.altText}
      />
    </main>
  );
}

const HOME_PAGE_QUERY = `#graphql 
  query HomePageData {  
    metaobjects(type: "home_page" first: 1) {
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

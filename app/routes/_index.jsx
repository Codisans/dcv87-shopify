import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, IMAGE_FRAGMENT, Money} from '@shopify/hydrogen';
import {PageTransition} from '~/components/PageTransition';
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
    <PageTransition className="h-min">
      <Image
        className="w-full object-cover max-h-[64vh] h-120"
        // width={backgroundField?.reference?.image?.width}
        // height={backgroundField?.reference?.image?.height}
        src={fields?.background?.reference?.image?.url}
        alt={fields?.background?.reference?.image?.altText}
      />
    </PageTransition>
  );
}

const HOME_PAGE_QUERY = `#graphql 
  query HomePage {  
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

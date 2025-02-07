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
    context.storefront.query(NEWSLETTER_PAGE_QUERY),
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

export default function Newsletter() {
  const {pageData} = useLoaderData();
  const fields = parseFields(pageData.fields);

  return (
    <main className="min-h-svh container flex justify-center items-center flex-col pt-24 pb-20 lg:pt-40">
      <div className="flex flex-col items-center text-center max-w-md w-full px-gutter">
        <h1 className="text-h3 text-red pb-10 lg:pb-16 uppercase">
          {fields?.heading?.value || 'Join our newsletter'}
        </h1>
        <input
          className="w-full uppercase px-8 py-4 border-2 bg-black border-red focus:outline-none focus:ring-orange focus:ring-2"
          type="email"
          placeholder="Email"
        />
        <button className="mt-8 w-full button">Subscribe</button>
      </div>
    </main>
  );
}

const NEWSLETTER_PAGE_QUERY = `#graphql 
  query NewsletterPage {  
    metaobjects(type: "newsletter_page" first: 1) {
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

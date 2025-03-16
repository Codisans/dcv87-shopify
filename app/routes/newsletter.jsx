import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, IMAGE_FRAGMENT, Money} from '@shopify/hydrogen';
import {parseFields} from '~/utils/parseFields';
import {MailchimpForm} from '~/components/MailchimpForm';
import {ShopifyMedia} from '~/components/ShopifyMedia';

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
    <main>
      <div className="sticky top-0 inset-x-0 min-h-svh h-svh overflow-hidden clip-inset-0 mb-[-100svh]">
        <ShopifyMedia
          className="w-full h-svh object-cover"
          loading="eager"
          media={fields?.background?.reference}
        />
      </div>
      <div className="min-h-svh relative z-10 container flex justify-center items-center flex-col pt-24 pb-20 lg:pt-32">
        <div className="flex flex-col items-center text-center max-w-md w-full px-gutter">
          <h1 className="text-h3 text-red pb-10 lg:pb-16 uppercase">
            {fields?.heading?.value || 'Join our newsletter'}
          </h1>
          <MailchimpForm successMessage={fields?.success_message?.value} />
        </div>
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

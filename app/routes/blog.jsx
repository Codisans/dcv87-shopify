import {defer} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PageTransition} from '~/components/PageTransition';
import {Article} from '~/components/Article';
import {useEffect} from 'react';
import {parseFields} from '~/utils/parseFields';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `DCV'87 | Blogs`}];
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const [{blog}, {metaobjects}] = await Promise.all([
    context.storefront.query(BLOG_QUERY, {
      variables: {
        blogHandle: 'news',
        ...paginationVariables,
      },
    }),
    context.storefront.query(BLOG_PAGE_QUERY),
  ]);

  if (!blog) {
    throw new Response('Not found', {status: 404});
  }

  return {blog, metaobjects};
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

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog, metaobjects} = useLoaderData();
  const {articles} = blog;
  const pageData = metaobjects.nodes[0];
  const fields = parseFields(pageData.fields);

  useEffect(() => {
    console.log(fields);
  }, [fields]);

  return (
    <PageTransition>
      <h1 className="fixed z-header top-28 left-1/2 -translate-x-1/2 text-h3 uppercase text-red">
        Blog
      </h1>
      <Image
        className="fixed inset-0 w-full h-full object-cover"
        alt="Blog"
        loading="eager"
        data={fields.background.reference.image}
      />
      <div className="relative z-10 py-64 container grid-layout">
        <div className="col-start-1 col-end-3">
          <ul className="sticky top-64 flex flex-col gap-y-2 text-h3 uppercase border-l border-r border-white px-gap">
            <li>
              <Link to="/blog">Latest</Link>
            </li>
            <li>
              <Link to="/blog">Jan 2024</Link>
            </li>
            <li>
              <Link to="/blog">Feb 2024</Link>
            </li>
            <li>
              <Link to="/blog">Mar 2024</Link>
            </li>
            <li>
              <Link to="/blog">Apr 2024</Link>
            </li>
            <li>
              <Link to="/blog">May 2024</Link>
            </li>
          </ul>
        </div>
        <div className="col-start-3 col-end-10">
          <PaginatedResourceSection
            resourcesClassName="flex flex-col gap-y-10"
            connection={articles}
          >
            {({node: article, index}) => (
              <BlogPost
                article={article}
                key={article.id}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </div>
    </PageTransition>
  );
}

/**
 * @param {{
 *   article: ArticleItemFragment;
 *   loading?: HTMLImageElement['loading'];
 * }}
 */
function BlogPost({article, loading}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));
  return (
    <div className="flex flex-col gap-y-8" key={article.id}>
      <h2 className="sr-only">{article.title}</h2>
      <time className="block w-full py-2 border-b-2 border-white text-h3 text-red uppercase">
        {publishedAt}
      </time>
      {article.image && (
        <Image
          className="w-full"
          alt={article.image.altText || article.title}
          data={article.image}
          loading={loading}
          sizes="(min-width: 768px) 70vw, 90vw"
        />
      )}
      <div
        className="rich-text"
        dangerouslySetInnerHTML={{__html: article.contentHtml}}
      />
    </div>
  );
}

const BLOG_PAGE_QUERY = `#graphql 
  query BlogPage {  
    metaobjects(type: "blog_page" first: 1) {
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
                }
              }
            }
        }
      }
    }
  }
`;

const BLOG_QUERY = `#graphql
  query Blog(
    $blogHandle: String!
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    contentHtml
    blog {
      handle
    }
  }
`;

// const BLOGS_QUERY = `#graphql
//   query Blog(
//     $language: LanguageCode
//     $blogHandle: String!
//     $first: Int
//     $last: Int
//     $startCursor: String
//     $endCursor: String
//   ) @inContext(language: $language) {
//     blog(handle: $blogHandle) {
//       title
//       seo {
//         title
//         description
//       }
//       articles(
//         first: $first,
//         last: $last,
//         before: $startCursor,
//         after: $endCursor
//       ) {
//         nodes {
//           ...ArticleItem
//         }
//         pageInfo {
//           hasPreviousPage
//           hasNextPage
//           hasNextPage
//           endCursor
//           startCursor
//         }

//       }
//     }
//   }
//   fragment ArticleItem on Article {
//     author: authorV2 {
//       name
//     }
//     contentHtml
//     handle
//     id
//     image {
//       id
//       altText
//       url
//       width
//       height
//     }
//     publishedAt
//     title
//     contentHtml
//     blog {
//       handle
//     }
//   }
// `;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
// const BLOGS_QUERY = `#graphql
//   query Blogs(
//     $country: CountryCode
//     $endCursor: String
//     $first: Int
//     $language: LanguageCode
//     $last: Int
//     $startCursor: String
//   ) @inContext(country: $country, language: $language) {
//     blogs(
//       first: $first,
//       last: $last,
//       before: $startCursor,
//       after: $endCursor
//     ) {
//       pageInfo {
//         hasNextPage
//         hasPreviousPage
//         startCursor
//         endCursor
//       }
//       nodes {
//         title
//         handle
//         seo {
//           title
//           description
//         }
//       }
//     }
//   }
// `;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

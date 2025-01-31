import {defer} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PageTransition} from '~/components/PageTransition';
import {Article} from '~/components/Article';
import {useEffect} from 'react';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Blogs`}];
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

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOG_QUERY, {
      variables: {
        blogHandle: 'news',
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog) {
    throw new Response('Not found', {status: 404});
  }

  return {blog};
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
  const {blog} = useLoaderData();
  const {articles} = blog;

  useEffect(() => {
    console.log(blog);
  }, [blog]);

  return (
    <PageTransition>
      <div className="blogs p-40">
        <h1>Blog</h1>
        <div className="grid-layout">
          <div className="col-start-1 col-end-11">
            <PaginatedResourceSection connection={articles}>
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
    <div className="blog-article" key={article.id}>
      {article.image && (
        <div className="blog-article-image">
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="3/2"
            data={article.image}
            loading={loading}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
      <h3>{article.title}</h3>
      <small>{publishedAt}</small>
      <div
        className="rich-text"
        dangerouslySetInnerHTML={{__html: article.contentHtml}}
      />
    </div>
  );
}

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

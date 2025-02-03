import {defer} from '@shopify/remix-oxygen';
import {Await, Link, useLoaderData} from '@remix-run/react';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Article} from '~/components/Article';
import {Suspense, useEffect, useRef} from 'react';
import {parseFields} from '~/utils/parseFields';

import {ParallaxLogos} from '~/components/ParallaxLogos';
import {BackgroundMedia} from '~/components/BackgroundMedia';

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
    pageBy: 6,
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
  const logosData = context.storefront.query(LOGOS_QUERY).catch((error) => {
    // Log query errors, but don't throw them so the page can still render
    console.error(error);
    return null;
  });
  return {logos: logosData};
}

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog, metaobjects, logos} = useLoaderData();
  const {articles} = blog;
  const pageData = metaobjects.nodes[0];
  const fields = parseFields(pageData.fields);
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (observerRef.current != null) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMoreRef.current.click();
          }
        });
      },
      {
        rootMargin: '0px 0px 300px 0px',
      },
    );
  }, []);

  useEffect(() => {
    if (observerRef.current == null) return;
    if (loadMoreRef.current != null) {
      observerRef.current.unobserve(loadMoreRef.current);
    }

    loadMoreRef.current = document.querySelector(
      '.paginated-resource-section + a',
    );

    if (loadMoreRef.current == null) return;

    observerRef.current.observe(loadMoreRef.current);
  }, [articles, observerRef.current]);

  return (
    <main className="page-transition min-h-svh">
      <h1 className="sr-only">Blog</h1>
      <BackgroundMedia
        loading="eager"
        image={fields?.background?.reference?.image}
      />
      <div className="relative z-10 py-64 container grid-layout">
        <div className="-sm:hidden col-start-1 col-end-3">
          <ul className="sticky top-64 flex flex-col gap-y-2 text-h3 uppercase border-l border-r border-white px-gap">
            <li>
              <Link className="clip-hover clip-hover--white" to="/blog">
                Latest
              </Link>
            </li>
            <li>
              <Link className="clip-hover clip-hover--white" to="/blog">
                Jan 2024
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-start-1 sm:col-start-3 col-end-10 blog-pagination">
          <PaginatedResourceSection
            resourcesClassName="flex flex-col gap-y-10 paginated-resource-section"
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
        <div className="col-start-10 col-end-13 sm:col-end-12">
          <Suspense>
            <Await resolve={logos}>
              {(data) => <ParallaxLogos data={data} />}
            </Await>
          </Suspense>
        </div>
      </div>
    </main>
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

const LOGOS_QUERY = `#graphql 
  query Logos {  
    metaobjects(type: "logo" first: 20) {
      nodes {
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

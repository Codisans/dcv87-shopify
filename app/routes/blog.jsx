import {defer} from '@shopify/remix-oxygen';
import {Await, Link, useLoaderData} from '@remix-run/react';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Article} from '~/components/Article';
import {Suspense, useEffect, useRef} from 'react';
import {parseFields} from '~/utils/parseFields';

import {Logos} from '~/components/Logos';
import {BackgroundMedia} from '~/components/BackgroundMedia';
import moment from 'moment';

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

  const searchParams = new URL(request.url).searchParams;
  const [{blog}, {metaobjects}] = await Promise.all([
    context.storefront.query(BLOG_QUERY, {
      variables: {
        blogHandle: 'news',
        query: `created_at:<=${searchParams.get('max-date')}`,
        ...paginationVariables,
      },
    }),
    context.storefront.query(BLOG_PAGE_QUERY),
  ]);

  if (!blog) {
    throw new Response('Not found', {status: 404});
  }

  return {blog, metaobjects, maxDate: searchParams.get('max-date')};
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
  const blogDatesData = context.storefront
    .query(BLOG_DATES_QUERY, {
      variables: {
        blogHandle: 'news',
        first: 250,
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    logos: logosData,
    blogDates: blogDatesData,
  };
}

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog, metaobjects, logos, blogDates, maxDate} = useLoaderData();
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
    <main className="min-h-lvh">
      <h1 className="sr-only">Blog</h1>
      <BackgroundMedia loading="eager" media={fields?.background?.reference} />
      <div className="pt-64 pb-32 container grid-layout !max-w-[1200px]">
        <div className="-sm:hidden col-start-1 col-end-3">
          <Suspense>
            <Await resolve={blogDates}>
              {(data) => (
                <ul className="relative z-10 flex flex-col gap-y-2 text-h3 uppercase border-l border-r border-white pl-gap pr-2">
                  <Link
                    to="/blog"
                    className={`clip-hover ${
                      maxDate == null ? 'current' : ''
                    } `}
                  >
                    Latest
                  </Link>
                  {Array.from(
                    new Set(
                      data.blog.articles.nodes.map((x) =>
                        moment(x.publishedAt).endOf('month'),
                      ),
                    ),
                  ).map((d, i) => (
                    <Link
                      key={i}
                      to={`/blog?max-date=${d.format('YYYY-MM-DD')}`}
                      className={`clip-hover text-nowrap ${
                        maxDate == d.format('YYYY-MM-DD') ? 'current' : ''
                      }`}
                    >
                      {d.format('MMM YYYY')}
                    </Link>
                  ))}
                </ul>
              )}
            </Await>
          </Suspense>
        </div>
        <div className="col-start-1 sm:col-start-3 col-end-11 blog-pagination relative z-10 ">
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
        <div className="col-start-11 col-end-13 pt-14">
          <Suspense>
            <Await resolve={logos}>{(data) => <Logos data={data} />}</Await>
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
      <time className="inline-flex items-end h-14 w-full pb-2 border-b-2 border-white text-h3 text-red uppercase">
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

const LOGOS_QUERY = `#graphql 
  query Logos {  
    metaobjects(type: "logo" first: 50) {
      nodes {
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

const BLOG_DATES_QUERY = `#graphql
  query BlogDates(
    $blogHandle: String!
    $language: LanguageCode
    $first: Int
    $last: Int
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      articles(
        first: $first,
        last: $last,
        sortKey: PUBLISHED_AT,
        reverse: false,
      ) {
        nodes {
          publishedAt
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
    $query: String
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
        after: $endCursor,
        sortKey: PUBLISHED_AT,
        reverse: true,
        query: $query,
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

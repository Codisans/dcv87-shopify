export const ASSET_QUERY = (type = '', first = 1) => `#graphql
  query ShopifyAsset {
    metaobjects(type: "${type}" first: ${first}) {
      nodes {
        handle
        fields {
          value
        }
      }
    }
  }
`;

export const METAOBJECT_QUERY = (type = '', first = 1) => `#graphql
  query ShopifyMetaobject {
    metaobjects(type: "${type}" first: ${first}) {
      nodes {
        fields {
          key
          value
        }
      }
    }
  }
`;

export const PAGE_QUERY = (handle = '') => `#graphql
  query ShopifyPage {
    metaobject(handle: "${handle}") {
      node {
        id
        handle
      }
    }
  }
`;

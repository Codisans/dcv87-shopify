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

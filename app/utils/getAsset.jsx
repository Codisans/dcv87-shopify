export function getAsset(id, env) {
  return `https://${env.CDN_DOMAIN}/cdn/shop/files/images.png?v=${id}`;
}

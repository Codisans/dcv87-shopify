import {Image} from '@shopify/hydrogen';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image}) {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <div className="w-80 h-80">
      <Image
        key={image.id}
        className="object-contain"
        alt={image.altText || 'Product Image'}
        width={image.width}
        height={image.height}
        aspectRatio="1/1"
        data={image}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */

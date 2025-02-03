import {Image} from '@shopify/hydrogen';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image}) {
  if (!image) return;

  return (
    <div key={image.id} className="w-full aspect-square relative">
      <Image
        className="object-contain w-full h-full asbolute inset-0"
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

import {Image} from '@shopify/hydrogen';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image, ...props}) {
  if (!image) return;

  return (
    <div
      key={image.id}
      className="w-[16rem] sm:w-[20rem] lg:w-[24rem] aspect-square relative pointer-events-auto"
    >
      <Image
        className="object-contain w-full h-full absolute inset-0"
        alt={image.altText || 'Product Image'}
        width={image.width}
        height={image.height}
        aspectRatio="1/1"
        data={image}
        sizes="(min-width: 45em) 420px, 80vw"
        {...props}
      />
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */

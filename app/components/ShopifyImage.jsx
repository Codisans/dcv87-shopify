import {Image} from '@shopify/hydrogen';

export const ShopifyImage = ({image, className = 'w-full', ...props}) => {
  if (!image) return null;

  return (
    <Image
      className={className}
      width={image?.width}
      height={image?.height}
      src={image?.url}
      alt={image?.altText}
      {...props}
    />
  );
};

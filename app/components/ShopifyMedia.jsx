import {Image} from '@shopify/hydrogen';
import {ShopifyVideo} from './ShopifyVideo';
import {ShopifyImage} from './ShopifyImage';

export const ShopifyMedia = ({media, className = 'w-full', ...props}) => {
  if (!media) return null;

  switch (media.__typename) {
    case 'Video':
      return (
        <ShopifyVideo
          className={className}
          video={media}
          autoPlay
          muted
          playsInline
        />
      );
    case 'MediaImage':
      return (
        <ShopifyImage className={className} image={media.image} {...props} />
      );
    default:
      return null;
  }
};

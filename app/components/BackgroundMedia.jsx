import {Image} from '@shopify/hydrogen';
import {ShopifyMedia} from './ShopifyMedia';

export const BackgroundMedia = ({
  media,
  className = '',
  mediaClassName = '',
  ...props
}) => {
  if (!media) return;
  return (
    <div
      {...props}
      className={`${className} sticky top-0 inset-x-0 min-h-lvh h-lvh overflow-hidden clip-inset-0 mb-[-100lvh]`}
    >
      <ShopifyMedia
        className={`${mediaClassName} w-full h-lvh object-cover`}
        media={media}
      />
    </div>
  );
};

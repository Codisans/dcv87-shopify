import {Image} from '@shopify/hydrogen';
import {useEffect} from 'react';

export const ShopifyMedia = ({media, className = 'w-full', ...props}) => {
  useEffect(() => {
    console.log(media);
  }, [media]);

  if (!media) return null;

  switch (media.__typename) {
    case 'Video':
      return (
        <video
          className={className}
          src={media?.sources[0]?.url}
          {...props}
          autoPlay
          muted
          playsInline
          type="video/mp4"
        />
      );
    case 'MediaImage':
      const image = media.image;

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
    default:
      return null;
  }
};

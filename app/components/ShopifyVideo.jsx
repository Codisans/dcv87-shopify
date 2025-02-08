import {Video} from '@shopify/hydrogen';

export const ShopifyVideo = ({video, className = 'w-full', ...props}) => {
  if (!video) return null;

  return (
    <Video
      className={className}
      data={video}
      {...props}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
    />
  );
};

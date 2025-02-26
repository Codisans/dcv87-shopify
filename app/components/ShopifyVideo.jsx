import {Video} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';

export const ShopifyVideo = ({video, className = 'w-full', ...props}) => {
  const videoRef = useRef(null);

  if (!video) return null;

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.setAttribute('muted', '');
  }, [videoRef]);

  return (
    <Video
      ref={videoRef}
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

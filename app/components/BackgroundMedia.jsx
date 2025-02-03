import {Image} from '@shopify/hydrogen';

export const BackgroundMedia = ({image, ...props}) => {
  if (!image) return;
  return (
    <div className="fixed inset-0 overflow-hidden clip-inset-0">
      <Image
        {...props}
        className="w-full h-lvh object-cover"
        width={image?.width}
        height={image?.height}
        src={image?.url}
        alt={image?.altText}
      />
    </div>
  );
};

import {Image} from '@shopify/hydrogen';

export const BackgroundMedia = ({image, className, ...props}) => {
  if (!image) return;
  return (
    <div className="sticky top-0 inset-x-0 min-h-lvh h-lvh overflow-hidden clip-inset-0 mb-[-100lvh]">
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

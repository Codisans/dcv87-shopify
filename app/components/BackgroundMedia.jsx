import {Image} from '@shopify/hydrogen';

export const BackgroundMedia = ({
  image,
  className = '',
  mediaClassName = '',
  ...props
}) => {
  if (!image) return;
  return (
    <div
      {...props}
      className={`${className} sticky top-0 inset-x-0 min-h-lvh h-lvh overflow-hidden clip-inset-0 mb-[-100lvh]`}
    >
      <Image
        className={`${mediaClassName} w-full h-lvh object-cover`}
        width={image?.width}
        height={image?.height}
        src={image?.url}
        alt={image?.altText}
      />
    </div>
  );
};

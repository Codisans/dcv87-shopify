import {Link, useNavigate} from '@remix-run/react';
import {AddToCartButton} from './AddToCartButton';
import {Image} from '@shopify/hydrogen';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductColors({productOptions, selectedVariant}) {
  const navigate = useNavigate();
  const colorOption = productOptions.find(
    (option) => option.name?.toLowerCase() === 'color',
  );

  if (!colorOption || colorOption?.optionValues.length === 1) return null;

  return (
    <div className="product-form">
      <div className="product-options">
        <h5 className="sr-only">{colorOption.name}</h5>
        <div className="flex flex-row md:flex-col lg:flex-row flex-nowrap">
          {colorOption.optionValues.map((value) => {
            const {
              name,
              handle,
              variant,
              variantUriQuery,
              selected,
              available,
              exists,
              isDifferentProduct,
              swatch,
            } = value;

            return (
              <div key={name} className={`relative pb-4`}>
                {variant.image && (
                  <Image
                    className="w-24 h-24 object-contain"
                    aspect="1/1"
                    data={variant.image}
                  />
                )}
                <button
                  type="button"
                  className={`absolute inset-0 z-10 border-b-4 md:border-l-4 md:border-b-0 lg:border-l-0 lg:border-b-4 ${
                    exists && !selected ? '  border-red' : 'border-white'
                  }`}
                  key={colorOption.name + name}
                  disabled={!exists}
                  onClick={() => {
                    if (!selected) {
                      navigate(`?${variantUriQuery}`, {
                        replace: true,
                        preventScrollReset: true,
                      });
                    }
                  }}
                >
                  <span className="sr-only">{name}</span>
                </button>
              </div>
            );
          })}
        </div>
        <br />
      </div>
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */

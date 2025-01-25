import {NavLink} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Autoplay} from 'swiper/modules';

export const HomeHeaderMenu = ({
  flip = false,
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}) => {
  return (
    <div
      className={`overflow-hidden w-full flex relative ${
        flip ? 'flex-row-reverse' : 'flex-row'
      } flex-nowrap`}
    >
      <nav
        className="w-4/5 text-red text-h1 overflow-hidden pl-12 py-4"
        role="navigation"
      >
        <Swiper
          className="w-full marquee-swiper overflow-visible"
          slidesPerView="auto"
          loop={true}
          modules={[Autoplay]}
          speed={7000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            reverseDirection: flip,
          }}
        >
          {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
            if (!item.url) return null;

            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
              item.url.includes(publicStoreDomain) ||
              item.url.includes(primaryDomainUrl)
                ? new URL(item.url).pathname
                : item.url;
            return (
              <SwiperSlide
                className="flex-none w-max inline-flex items-center after:content-[''] after:rounded-full after:inline-block after:size-6 after:bg-red after:mx-8 after:mt-4"
                key={item.id}
              >
                <NavLink
                  className="w-max clip-hover"
                  end
                  prefetch="intent"
                  to={url}
                >
                  {item.title}
                </NavLink>
              </SwiperSlide>
            );
          })}
          {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
            if (!item.url) return null;

            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
              item.url.includes(publicStoreDomain) ||
              item.url.includes(primaryDomainUrl)
                ? new URL(item.url).pathname
                : item.url;
            return (
              <SwiperSlide
                className="flex-none w-max inline-flex items-center after:content-[''] after:rounded-full after:inline-block after:size-6 after:bg-red after:mx-8 after:mt-4"
                key={item.id}
              >
                <NavLink
                  className="w-max clip-hover"
                  end
                  prefetch="intent"
                  to={url}
                >
                  {item.title}
                </NavLink>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </nav>
      <Image
        className={`absolute top-4 right-[calc(20%-4rem)] size-32 object-contain z-10 ${
          flip
            ? 'left-[calc(20%-4rem)]'
            : 'right-[calc(20%-4rem)] rotate-180 scale-y-[-1]'
        }`}
        width={100}
        height={100}
        src="/img/cool-hand.png"
        alt="cool hand"
      />
    </div>
  );
};

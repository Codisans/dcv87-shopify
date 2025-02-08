import {Image} from '@shopify/hydrogen';
import {TransitionLink} from './TransitionLink';
import {useCallback, useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {Symbol} from './Symbol';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Autoplay, FreeMode} from 'swiper/modules';

export const HomeHeaderMenu = ({
  flip = false,
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}) => {
  const bannerItems = (menu || FALLBACK_HEADER_MENU).items;

  return (
    <div className="text-home-nav overflow-hidden w-full relative">
      <Image
        className={`size-[1.2em] md:size-[1.3em] absolute top-2 sm:top-1 z-20 object-contain ${
          flip ? 'left-[0.25em]' : 'scale-x-[-1] right-[0.25em]'
        }`}
        width={120}
        height={120}
        src="/img/peace-hand.png"
        alt="Peace hand"
      />
      <nav
        className={`w-full text-red flex items-center h-home-header pt-2 marquee-swiper select-none ${
          flip ? 'pl-[0.6em]' : 'pr-[0.6em]'
        }`}
        role="navigation"
      >
        <Swiper
          modules={[Autoplay, FreeMode]}
          freeMode={{
            enabled: true,
            momentum: false,
          }}
          autoplay={{
            reverseDirection: flip,
            enabled: true,
            delay: 0,
            disableOnInteraction: false,
            waitForTransition: false,
          }}
          speed={1500}
          breakpoints={{
            640: {
              speed: 1800,
            },
            1024: {
              speed: 2000,
            },
          }}
          loop
          slidesPerView="auto"
          spaceBetween={0}
        >
          {bannerItems.concat(bannerItems).map((item, i) => {
            if (!item.url) return null;

            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
              item.url.includes(publicStoreDomain) ||
              item.url.includes(primaryDomainUrl)
                ? new URL(item.url).pathname
                : item.url;
            const isExternal = !url.startsWith('/');
            return (
              <SwiperSlide
                className={`swiper-no-swiping flex-none flex items-center flex-row w-[3em] md:w-[3.5em] ${
                  flip ? 'dot-divider-b' : 'dot-divider-a'
                }`}
                key={i}
              >
                <li>
                  {isExternal ? (
                    <a className="clip-hover" href={url} target="_blank">
                      {item.title}
                    </a>
                  ) : (
                    <TransitionLink
                      className="clip-hover"
                      end
                      prefetch={isExternal ? undefined : 'intent'}
                      target={isExternal ? '_blank' : '_self'}
                      to={url}
                    >
                      {item.title}
                    </TransitionLink>
                  )}
                </li>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </nav>
    </div>
  );
};

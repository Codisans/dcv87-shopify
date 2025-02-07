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
    <div
      className={`text-home-nav overflow-hidden w-full flex relative items-center ${
        flip ? 'flex-row' : 'flex-row-reverse'
      }`}
    >
      <div
        className={`pb-[0.15em] w-[1.5em] lg:w-[1.85em] flex-none ${
          flip ? '-sm:ml-[-0.5em]' : '-sm:mr-[-0.5em]'
        }`}
      >
        <Image
          className={`w-[1.5em] relative z-20 object-contain z-10 ${
            flip
              ? 'translate-x-[0.8em] sm:translate-x-[0.8em] ml-auto'
              : 'scale-x-[-1] translate-x-[-0.8em] sm:translate-x-[-0.8em] mr-auto'
          }`}
          width={120}
          height={120}
          src="/img/peace-hand.png"
          alt="Peace hand"
        />
      </div>
      <nav
        className="grow text-red overflow-hidden py-4 marquee-swiper"
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
          }}
          speed={2000}
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
                className={`flex-none flex items-center flex-row w-[3em] md:w-[3.5em] ${
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

export const HandItem = ({flip = false}) => {
  return (
    <Image
      className={`w-[1.5em] mx-auto object-contain z-10 ${
        flip
          ? 'scale-x-[-1] mr-[0.25em] md:mr-[0.34em]'
          : 'ml-[0.25em] md:ml-[0.34em]'
      }`}
      width={120}
      height={120}
      src="/img/peace-hand.png"
      alt="Peace hand"
    />
  );
};

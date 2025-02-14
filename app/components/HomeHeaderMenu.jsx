import {Image} from '@shopify/hydrogen';
import {TransitionLink} from './TransitionLink';
import {useCallback, useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {Symbol} from './Symbol';

export const HomeHeaderMenu = ({
  flip = false,
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}) => {
  const bannerItems = (menu || FALLBACK_HEADER_MENU).items;
  const containerRef = useRef(null);
  const groupRef = useRef(null);
  const itemRef = useRef(null);
  const tweenRef = useRef(null);
  const [tickerDimensions, setTickerDimensions] = useState(null);

  const getTickerDimensions = () => {
    const visibleWidth = containerRef.current?.clientWidth;
    const itemWidth = itemRef.current?.clientWidth;
    const totalExtraItems = Math.ceil(visibleWidth / itemWidth);
    return {
      visibleWidth,
      itemWidth,
      totalExtraItems,
    };
  };

  useEffect(() => {
    if (!containerRef.current || !itemRef.current) {
      return;
    }

    setTickerDimensions(getTickerDimensions());
    const resizeObserver = new ResizeObserver(() => {
      setTickerDimensions(getTickerDimensions());
    });
    resizeObserver.observe(itemRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!tickerDimensions) {
      return;
    }

    const {itemWidth, totalExtraItems} = tickerDimensions;

    if (tweenRef.current) {
      tweenRef.current.kill();

      if (groupRef.current.children.length > totalExtraItems + 1) {
        while (groupRef.current.children.length > totalExtraItems + 1) {
          groupRef.current.removeChild(groupRef.current.lastChild);
        }
      }
    }

    if (groupRef.current.children.length < totalExtraItems + 1) {
      for (let i = 0; i < totalExtraItems; i++) {
        groupRef.current.appendChild(itemRef.current.cloneNode(true));
      }
    }

    tweenRef.current = gsap.to(groupRef.current, {
      translateX: flip ? `+=${itemWidth}` : `-=${itemWidth}`,
      duration: itemWidth / (window.innerWidth < 640 ? 150 : 180),
      ease: 'none',
      repeat: -1,
      onReverseComplete: () => {
        tweenRef.current.totalTime(
          tweenRef.current.totalTime() + tweenRef.current.duration() * 100,
          true,
        );
      },
    });

    return () => {
      if (itemRef.current) {
        gsap.set(itemRef.current, {clearProps: 'all'});
      }

      tweenRef.current?.kill();
    };
  }, [tickerDimensions]);

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
        className={`w-full text-red flex items-center h-home-header pt-2 select-none ${
          flip ? 'pl-[0.6em]' : 'pr-[0.6em]'
        }`}
        role="navigation"
      >
        <div className="overflow-hidden" ref={containerRef}>
          <div
            ref={groupRef}
            className={`flex flex-row flex-nowrap ${
              flip ? '[direction:rtl]' : ''
            }`}
          >
            <ul
              ref={itemRef}
              className="flex flex-row items-center flex-nowrap gap-x-[0.4em] sm:gap-x-[0.6em]"
            >
              {bannerItems.map((item, i) => {
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
                  <li
                    key={i}
                    className={`flex-none flex items-center flex-row gap-x-[0.4em] sm:gap-x-[0.6em] w-max ${
                      flip
                        ? 'dot-divider-b first:pr-[0.4em] sm:first:pr-[0.6em]'
                        : 'dot-divider-a first:pl-[0.4em] sm:first:pl-[0.6em]'
                    }`}
                  >
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
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

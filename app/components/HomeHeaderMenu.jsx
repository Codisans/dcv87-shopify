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
  const groupRef = useRef(null);
  const itemsArrayRef = useRef([]);
  const [tickerDimensions, setTickerDimensions] = useState(null);

  const addItemRef = useCallback((node) => {
    if (node && !itemsArrayRef.current.includes(node)) {
      itemsArrayRef.current.push(node);
    }
  }, []);

  const getTickerDimensions = () => {
    const visibleWidth = groupRef.current?.clientWidth;
    const itemWidth = itemsArrayRef.current[0]?.clientWidth;
    const totalWidth = itemWidth * itemsArrayRef.current.length;
    const extraWidth = visibleWidth + Math.max(visibleWidth - totalWidth, 0);
    const extraItems = Math.ceil(extraWidth / itemWidth);
    return {
      visibleWidth,
      itemWidth,
      totalWidth,
      extraWidth,
      extraItems,
    };
  };

  useEffect(() => {
    if (!groupRef.current || !itemsArrayRef.current.length) {
      return;
    }

    setTickerDimensions(getTickerDimensions());
    const resizeObserver = new ResizeObserver(() => {
      setTickerDimensions(getTickerDimensions());
    });
    resizeObserver.observe(groupRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!tickerDimensions) {
      return;
    }

    const {totalWidth} = tickerDimensions;

    const tween = gsap.to(groupRef.current, {
      translateX: flip ? `+=${totalWidth}` : `-=${totalWidth}`,
      duration: totalWidth / 50,
      ease: 'none',
      repeat: -1,
      onReverseComplete: () => {
        tween.totalTime(tween.totalTime() + tween.duration() * 100, true);
      },
    });

    return () => {
      if (groupRef.current) {
        gsap.set(groupRef.current, {clearProps: 'all'});
      }
      tween?.kill();
    };
  }, [tickerDimensions]);

  return (
    <div
      className={`text-home-nav overflow-hidden w-full flex relative items-center ${
        flip ? 'flex-row-reverse' : 'flex-row'
      } flex-nowrap`}
    >
      <nav
        className="w-[calc(100vw-1.5em)] sm:w-[calc(100vw-2.5em)] flex-none text-red overflow-hidden"
        role="navigation"
      >
        <ul
          ref={groupRef}
          className={`flex w-full items-center ${
            flip ? '[direction:rtl] flex-row-reverse' : 'flex-row'
          }`}
        >
          {(menu || FALLBACK_HEADER_MENU).items?.map((item, i) => {
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
                ref={addItemRef}
                key={i}
                className="flex-none w-max inline-flex after:pointer-events-none items-center after:content-[''] after:rounded-full after:inline-block after:size-[0.3em] after:bg-red after:mx-8 after:mt-[0.1em]"
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
          {Array.from(
            {length: tickerDimensions?.extraItems || 0},

            (_, index) =>
              (menu || FALLBACK_HEADER_MENU).items[
                index % (menu || FALLBACK_HEADER_MENU).items.length
              ],
          )?.map((item, i) => {
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
                key={`${i}-extra`}
                className="flex-none w-max inline-flex after:pointer-events-none items-center after:content-[''] after:rounded-full after:inline-block after:size-6 after:bg-red after:mx-8 after:mt-4"
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
      </nav>
      <div className="grow">
        <Image
          className={`size-[1.6em] object-contain z-10 ${
            flip
              ? 'ml-auto translate-x-1/2'
              : 'mr-auto -translate-x-1/2 rotate-180 scale-y-[-1]'
          }`}
          width={120}
          height={120}
          src="/img/cool-hand.png"
          alt="cool hand"
        />
      </div>
    </div>
  );
};

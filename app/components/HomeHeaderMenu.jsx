import {Image} from '@shopify/hydrogen';
import {TransitionLink} from './TransitionLink';
import {useCallback, useEffect, useRef, useState} from 'react';
import gsap from 'gsap';

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
      translateX: `-=${totalWidth}`,
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
      className={`overflow-hidden w-full flex relative ${
        flip ? 'flex-row-reverse' : 'flex-row'
      } flex-nowrap`}
    >
      <nav
        className="w-4/5 text-red text-h1 overflow-hidden pl-12 py-4"
        role="navigation"
      >
        <ul ref={groupRef} className="flex w-full items-center">
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

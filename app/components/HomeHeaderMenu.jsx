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
      duration: totalWidth / 60,
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

  const bannerItems = flip
    ? (menu || FALLBACK_HEADER_MENU).items.reverse()
    : (menu || FALLBACK_HEADER_MENU).items;

  const extraItems = Array.from(
    {length: tickerDimensions?.extraItems || 0},
    (_, index) =>
      bannerItems[
        flip
          ? bannerItems.length - 1 - (index % bannerItems.length)
          : index % bannerItems.length
      ],
  );

  const renderedItems = flip
    ? extraItems.concat(bannerItems)
    : bannerItems.concat(extraItems);

  const liClasses = `flex flex-row items-center min-w-max w-[3em] md:w-[3.5em] flex-none ${
    flip ? 'dot-divider-b' : 'dot-divider-a'
  }`;

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
      <nav className="grow text-red overflow-hidden py-4" role="navigation">
        <ul
          ref={groupRef}
          className={`flex w-full items-center flex-row ${
            flip ? '[direction:rtl]' : ''
          }`}
        >
          {renderedItems?.map((item, i) => {
            const isExtra = i > bannerItems.length;
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
                ref={isExtra ? undefined : addItemRef}
                key={isExtra ? `${i}-flip` : `${i}-extra-flip`}
                className={liClasses}
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

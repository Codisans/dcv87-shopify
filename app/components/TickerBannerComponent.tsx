import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {TTickerBannerComponentEntry} from '~/types/TComponentEntry';
import React from 'react';

export type TickerBannerComponentProps = {
  data?: TTickerBannerComponentEntry;
};

export function TickerBannerComponent(props: TickerBannerComponentProps) {
  const {data} = props;

  if (data == null) return;

  const groupRef = useRef<HTMLUListElement>(null);
  const itemsArrayRef = useRef<HTMLElement[]>([]);
  const [tickerDimensions, setTickerDimensions] = useState<{
    visibleWidth: number;
    itemWidth: number;
    totalWidth: number;
    extraWidth: number;
    extraItems: number;
  } | null>(null);

  const addItemRef = useCallback((node: null) => {
    if (node && !itemsArrayRef.current.includes(node)) {
      itemsArrayRef.current.push(node);
    }
  }, []);

  const getTickerDimensions = () => {
    const visibleWidth = groupRef.current!.clientWidth;
    const itemWidth = itemsArrayRef.current[0].clientWidth;
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

  useLayoutEffect(() => {
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
      duration: totalWidth / 75,
      ease: 'none',
      repeat: -1,
      paused: true,
      onReverseComplete: () => {
        tween.totalTime(tween.totalTime() + tween.duration() * 100, true);
      },
    });

    const trigger = ScrollTrigger.create({
      trigger: groupRef.current,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      onToggle: ({isActive}) => {
        isActive ? tween.play() : tween.pause();
      },
      onUpdate: ({getVelocity, direction}) => {
        const velocity = getVelocity();
        if (velocity) {
          gsap.to(tween, {
            timeScale: velocity / 100 + direction,
          });
        }
        gsap.to(tween, {
          timeScale: direction,
        });
      },
    });

    return () => {
      if (groupRef.current) {
        gsap.set(groupRef.current, {clearProps: 'all'});
      }
      trigger?.kill();
      tween?.kill();
    };
  }, [tickerDimensions]);

  return (
    <section className="relative py-10 bg-black text-white-true before:absolute before:top-10 before:left-gutter">
      <div className="block pt-10 pb-14 lg:pt-28 lg:pb-32 overflow-hidden select-none">
        <ul ref={groupRef} className="flex w-full items-center">
          {data.fields.items?.map((item, i) => (
            <li
              ref={addItemRef}
              key={i}
              className="flex-none pr-16 lg:pr-36"
            ></li>
          ))}
          {Array.from(
            {length: tickerDimensions?.extraItems || 0},
            (_, index) => data.fields.items[index % data.fields.items.length],
          )?.map((item, i) => (
            <li key={i} className="flex-none pr-16 lg:pr-36"></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

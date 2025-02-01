import {Image} from '@shopify/hydrogen';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useLenis} from 'lenis/react';
import {useEffect, useRef} from 'react';
import {parseFields} from '~/utils/parseFields';

export const ParallaxLogos = ({data}) => {
  if (!data) return null;

  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const lenis = useLenis();

  useEffect(() => {
    if (!containerRef.current) return;

    const animationCallback = () => {
      const scrollY = lenis?.animatedScroll;
      containerRef.current.style.setProperty(
        '--translate-y',
        `${scrollY / 2}px`,
      );

      animationRef.current = window.requestAnimationFrame(() => {
        animationCallback();
      });
    };

    animationCallback();

    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  }, [containerRef.current, lenis]);

  return (
    <div className="w-full h-full">
      <ul
        ref={containerRef}
        className="flex flex-col will-change-transform h-min translate-y-[var(--translate-y,0)]"
      >
        {data.metaobjects.nodes?.map((logo, i) => {
          const logoFields = parseFields(logo.fields);
          if (!logoFields?.image?.reference?.image?.url) return null;
          const hasLink = logoFields?.link?.value != null;
          return (
            <li
              key={i}
              className={`relative w-full ${hasLink ? 'group/logo' : ''}`}
            >
              <Image
                className={`object-contain w-full ${
                  hasLink
                    ? 'group-hover/logo:opacity-80 transition-opacity duration-200 ease-in-out'
                    : ''
                }`}
                src={logoFields.image.reference.image.url}
                alt={logoFields.image.reference.image.altText}
                aspectRatio="1/1"
                width={240}
                height={240}
              />
              {hasLink && (
                <a
                  className="absolute inset-0"
                  href={logoFields?.link?.value}
                  target="_blank"
                >
                  <span className="sr-only">
                    {logoFields?.link?.name?.value}
                  </span>
                </a>
              )}
            </li>
          );
        })}
        {data.metaobjects.nodes?.map((logo, i) => {
          const logoFields = parseFields(logo.fields);
          if (!logoFields?.image?.reference?.image?.url) return null;
          const hasLink = logoFields?.link?.value != null;
          return (
            <li
              key={i}
              className={`relative w-full ${hasLink ? 'group/logo' : ''}`}
            >
              <Image
                className={`object-contain w-full ${
                  hasLink
                    ? 'group-hover/logo:opacity-80 transition-opacity duration-200 ease-in-out'
                    : ''
                }`}
                src={logoFields.image.reference.image.url}
                alt={logoFields.image.reference.image.altText}
                aspectRatio="1/1"
                width={240}
                height={240}
              />
              {hasLink && (
                <a
                  className="absolute inset-0"
                  href={logoFields?.link?.value}
                  target="_blank"
                >
                  <span className="sr-only">
                    {logoFields?.link?.name?.value}
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

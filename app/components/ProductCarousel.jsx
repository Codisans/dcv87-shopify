import {useLocation, useNavigate} from '@remix-run/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from '@remix-run/react';
import gsap from 'gsap';
import {useVariantUrl} from '~/lib/variants';
import {parseFields} from '~/utils/parseFields';
import {ProductImage} from '~/components/ProductImage';
import {useGSAP} from '@gsap/react';

export const ProductCarousel = ({products}) => {
  gsap.registerPlugin(useGSAP);
  const navigate = useNavigate();

  const [renderedItems, setRenderedItems] = useState([]);

  const dragInterfaceRef = useRef(null);
  const carouselRef = useRef(null);
  const groupRef = useRef(null);
  const placeholderRef = useRef(null);
  const tweenRef = useRef(null);
  const prevX = useRef(null);
  const currentDirection = useRef(1);
  const resizeObserverRef = useRef(null);
  const [tickerDimensions, setTickerDimensions] = useState(null);

  const getTickerDimensions = (productArray) => {
    const visibleWidth = carouselRef.current?.clientWidth;
    const itemWidth = placeholderRef.current?.clientWidth;
    const totalWidth = itemWidth * productArray.length;
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
    if (!groupRef.current || !placeholderRef.current) {
      return;
    }

    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(() => {
      const tickerDimensions = getTickerDimensions(products);
      setTickerDimensions(tickerDimensions);
      setRenderedItems([
        ...products,
        ...products.slice(0, tickerDimensions.extraItems + 1),
      ]);
    });
    resizeObserverRef.current.observe(carouselRef.current);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [groupRef.current, placeholderRef.current]);

  const {contextSafe, context} = useGSAP(
    (context) => {
      context.kill();
      if (!tickerDimensions) {
        return;
      }

      const {totalWidth} = tickerDimensions;

      tweenRef.current = gsap.to(groupRef.current, {
        translateX: `-=${totalWidth}`,
        duration: totalWidth / 180,
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
        tweenRef.current = null;
        context.kill();
        prevX.current = null;
      };
    },
    {dependencies: [renderedItems]},
  );

  const stopTween = contextSafe(() => {
    tweenRef.current?.kill();
  });

  const manipulateTween = contextSafe(({timeScale}) => {
    gsap.to(tweenRef.current, {
      timeScale: timeScale,
    });
  });

  const pauseTween = () => manipulateTween({timeScale: 0});

  const playTween = () => {
    prevX.current = null;
    manipulateTween({timeScale: currentDirection.current});
  };

  const handleDrag = (currentX) => {
    if (currentX == 0 || prevX.current === currentX) return;

    if (!prevX.current) {
      prevX.current = currentX;
      return;
    }

    const delta = prevX.current - currentX;
    currentDirection.current = delta > 0 ? 1 : -1;
    const sensitivity = 2;
    const timeScale =
      delta === 0 ? currentDirection.current : delta * sensitivity;
    manipulateTween({timeScale: timeScale});
    prevX.current = currentX;
  };

  const handleMouseEnter = () => {
    pauseTween();
  };

  const handleMouseLeave = () => {
    playTween();
  };

  const handleMouseDrag = (e) => {
    handleDrag(e.pageX);
  };

  const handleMouseDragEnd = () => {
    playTween();
  };

  const handleTouchEnd = () => {
    playTween();
  };

  const handleTouchMove = (e) => {
    handleDrag(e.touches[0]?.clientX);
  };

  useEffect(() => {
    if (!dragInterfaceRef.current || !carouselRef.current) return;

    const hasMouse = window.matchMedia(
      '(pointer: fine) and (hover: hover)',
    ).matches;

    if (hasMouse) {
      carouselRef.current?.addEventListener('mouseenter', handleMouseEnter, {
        passive: false,
      });
      carouselRef.current?.addEventListener('mouseleave', handleMouseLeave, {
        passive: false,
      });
      dragInterfaceRef.current?.addEventListener('drag', handleMouseDrag, {
        passive: false,
      });
      dragInterfaceRef.current?.addEventListener(
        'dragend',
        handleMouseDragEnd,
        {
          passive: false,
        },
      );
    } else {
      dragInterfaceRef.current?.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      dragInterfaceRef.current?.addEventListener('touchend', handleTouchEnd, {
        passive: false,
      });
    }

    return () => {
      carouselRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      carouselRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      dragInterfaceRef.current?.removeEventListener('drag', handleMouseDrag);
      dragInterfaceRef.current?.removeEventListener(
        'dragend',
        handleMouseDragEnd,
      );
      dragInterfaceRef.current?.removeEventListener(
        'touchmove',
        handleTouchMove,
      );
      dragInterfaceRef.current?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragInterfaceRef, carouselRef]);

  const navigateToProduct = contextSafe((target, url) => {
    tweenRef.current?.kill();
    const rect = target.getBoundingClientRect();
    const centerOffset =
      window.innerWidth / 2 - rect.left - target.offsetWidth / 2;

    target.parentElement.classList.add('in-view');
    carouselRef.current?.classList.remove('in-view');

    gsap
      .to(carouselRef.current, {
        x: centerOffset,
        duration: 0.3,
        ease: 'power2.inOut',
      })
      .then(() => navigate(url));
  });

  return (
    <div
      ref={dragInterfaceRef}
      className="relative h-svh z-10 flex flex-col justify-center py-12 lg:py-20"
    >
      <div
        ref={carouselRef}
        className="w-full overflow-hidden in-view h-[16rem] sm:h-[20rem] lg:h-[24rem]"
      >
        <ul
          ref={groupRef}
          className="flex flex-row flex-nowrap w-max min-w-full items-center"
        >
          <li
            ref={placeholderRef}
            className="w-[16rem] sm:w-[20rem] lg:w-[24rem] absolute pointer-events-none invisible"
          ></li>
          {renderedItems?.map((product, i) => (
            <li key={`${product.id}-${i}`} className="flex-none">
              <ProductItem
                product={product}
                navigateToProduct={navigateToProduct}
                loading={i < 8 ? 'eager' : undefined}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading, navigateToProduct}) {
  const variantUrl = useVariantUrl(product.handle);
  const mediaRef = useRef(null);

  useEffect(() => {
    if (!product || mediaRef.current) return;

    mediaRef.current = document.getElementById(`${product.handle}-media`);
  }, [product]);

  const handleClick = (e) => {
    e.preventDefault();
    mediaRef.current?.classList.add('!opacity-100');
    navigateToProduct(e.target, variantUrl);
  };

  return (
    <div
      key={product.id}
      className="relative in-view:opacity-100 opacity-0 transition-opacity duration-300 ease-slide"
    >
      {product.featuredImage && (
        <ProductImage
          image={product.featuredImage}
          sizes="(min-width: 45em) 400px, 80vw"
          loading={loading}
          aspectRatio="1/1"
        />
      )}
      <Link
        className="absolute inset-0"
        key={product.id}
        onClick={handleClick}
        prefetch="viewport"
        to={variantUrl}
      >
        <h4 className="sr-only">{product.title}</h4>
      </Link>
    </div>
  );
}

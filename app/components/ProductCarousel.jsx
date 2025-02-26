import {useLocation, useNavigate} from '@remix-run/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from '@remix-run/react';
import gsap from 'gsap';
import {useVariantUrl} from '~/lib/variants';
import {parseFields} from '~/utils/parseFields';
import {ProductImage} from '~/components/ProductImage';

export const ProductCarousel = ({collection, products}) => {
  const {pathname} = useLocation();

  const dragInterfaceRef = useRef(null);
  const carouselRef = useRef(null);
  const groupRef = useRef(null);
  const itemsArrayRef = useRef([]);
  const tweenRef = useRef(null);
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

  let prevX = null;
  let currentDirection = 1;

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
  }, [groupRef.current, itemsArrayRef.current]);

  useEffect(() => {
    if (groupRef.current) {
      gsap.set(groupRef.current, {clearProps: 'all'});
    }

    tweenRef.current?.kill();

    // carouselRef.current?.removeEventListener('mouseenter', handleMouseEnter);
    // carouselRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    // dragInterfaceRef.current?.removeEventListener('drag', handleMouseDrag);
    // dragInterfaceRef.current?.removeEventListener('dragend', handleDragEnd);
    // dragInterfaceRef.current?.removeEventListener(
    //   'touchmove',
    //   handleTouchMove,
    // );
    // dragInterfaceRef.current?.removeEventListener('touchend', handleDragEnd);

    if (!tickerDimensions) {
      return;
    }

    const {totalWidth} = tickerDimensions;

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    tweenRef.current = gsap.to(groupRef.current, {
      translateX: `-=${totalWidth}`,
      duration: totalWidth / 180,
      ease: 'none',
      repeat: -1,
      onReverseComplete: () => {
        console.log('onReverseComplete');
        tweenRef.current.totalTime(
          tweenRef.current.totalTime() + tweenRef.current.duration() * 100,
          true,
        );
      },
    });

    const hasMouse = window.matchMedia(
      '(pointer: fine) and (hover: hover)',
    ).matches;

    const updateTween = (delta) => {
      const velocity = Math.abs(delta);

      if (velocity === 0) {
        return;
      }

      const direction = delta === 0 ? currentDirection : delta < 0 ? 1 : -1;
      currentDirection = direction;

      if (velocity > 0) {
        gsap.to(tweenRef.current, {
          timeScale: velocity * direction * 1.4,
        });
      }
    };
    const handleDrag = (e, x) => {
      if (x == 0) return;
      if (!prevX) {
        prevX = x;
        return;
      }
      updateTween(x - prevX);
      prevX = x;
    };
    const handleMouseEnter = () => {
      gsap.to(tweenRef.current, {
        timeScale: 0,
      });
    };
    const handleMouseLeave = () => {
      gsap.to(tweenRef.current, {
        timeScale: currentDirection,
      });
    };
    const handleMouseDrag = (e) => {
      handleDrag(e, e.pageX);
    };
    const handleDragEnd = () => {
      prevX = null;
      gsap.to(tweenRef.current, {
        timeScale: currentDirection,
      });
    };
    const handleTouchEnd = () => {
      prevX = null;
      gsap.to(tweenRef.current, {
        timeScale: currentDirection,
      });
    };

    const handleTouchMove = (e) => {
      handleDrag(e, e.touches[0]?.clientX);
    };

    if (hasMouse) {
      dragInterfaceRef.current?.addEventListener('drag', handleMouseDrag, {
        passive: false,
      });
      dragInterfaceRef.current?.addEventListener('dragend', handleDragEnd, {
        passive: false,
      });
      carouselRef.current?.addEventListener('mouseenter', handleMouseEnter, {
        passive: false,
      });
      carouselRef.current?.addEventListener('mouseleave', handleMouseLeave, {
        passive: false,
      });
    } else {
      dragInterfaceRef.current?.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      dragInterfaceRef.current?.addEventListener('touchend', handleTouchEnd, {
        passive: false,
      });
    }

    return () => {
      if (groupRef.current) {
        gsap.set(groupRef.current, {clearProps: 'all'});
      }

      tweenRef.current?.kill();

      carouselRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      carouselRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      dragInterfaceRef.current?.removeEventListener('drag', handleMouseDrag);
      dragInterfaceRef.current?.removeEventListener('dragend', handleDragEnd);
      dragInterfaceRef.current?.removeEventListener(
        'touchmove',
        handleTouchMove,
      );
      dragInterfaceRef.current?.removeEventListener('touchend', handleDragEnd);
    };
  }, [tickerDimensions]);

  const carouselItems = products.concat(
    Array.from(
      {length: tickerDimensions?.extraItems || 0},
      (_, index) => products[index % products.length],
    ),
  );

  return (
    <div
      ref={dragInterfaceRef}
      className="relative h-svh z-10 flex flex-col justify-center py-12 lg:py-20"
    >
      <div ref={carouselRef} className="w-full overflow-hidden in-view">
        <ul ref={groupRef} className="flex w-full items-center">
          {carouselItems?.map((product, i) => (
            <li
              ref={i < products.length ? addItemRef : undefined}
              key={`${collection.title}-${product.id}-${i}`}
              className="flex-none"
            >
              <ProductItem
                product={product}
                tweenRef={tweenRef}
                carouselRef={carouselRef}
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
function ProductItem({product, loading, carouselRef, tweenRef}) {
  const variantUrl = useVariantUrl(product.handle);
  const mediaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!product || mediaRef.current) return;

    mediaRef.current = document.getElementById(`${product.handle}-media`);
  }, [product]);

  const handleClick = (e) => {
    e.preventDefault();
    mediaRef.current?.classList.add('!opacity-100');
    const rect = e.target.getBoundingClientRect();
    const centerOffset =
      window.innerWidth / 2 - rect.left - e.target.offsetWidth / 2;
    tweenRef.current.pause();

    window.requestAnimationFrame(() => {
      e.target.parentElement.classList.add('in-view');
      carouselRef.current?.classList.remove('in-view');
      gsap
        .to(carouselRef.current, {
          x: centerOffset,
          duration: 0.3,
          ease: 'power2.inOut',
        })
        .then(() => navigate(variantUrl));
    });
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

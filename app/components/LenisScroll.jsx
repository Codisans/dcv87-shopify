import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ReactLenis, useLenis} from 'lenis/react';
import {useEffect, useRef} from 'react';

gsap.registerPlugin(ScrollTrigger);

const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
};

export const LenisScroll = ({children}) => {
  const lenisRef = useRef(null);

  let prevPos = 0;

  let lenis = useLenis(({scroll}) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    if (!lenis) return;

    window.lenis = lenis;
    document.documentElement.style.setProperty(
      '--scroll-y',
      lenis.animatedScroll,
    );

    const updateLenis = (time) => {
      document.documentElement.style.setProperty(
        '--scroll-y',
        lerp(prevPos, lenis.animatedScroll, 0.15),
      );
      prevPos = lenis.animatedScroll;
      lenis?.raf(time * 1000);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    ScrollTrigger.clearScrollMemory('manual');
    ScrollTrigger.refresh();

    gsap.ticker.add(updateLenis);

    if (lenis?.options.content) {
      resizeObserver.observe(lenis.options.content);
    }

    return () => {
      resizeObserver?.disconnect();
      gsap.ticker.remove(updateLenis);
    };
  }, [lenis]);

  return (
    <ReactLenis root options={{smoothTouch: true}} autoRaf={false}>
      {children}
    </ReactLenis>
  );
};

// import gsap from 'gsap';
// import {ReactLenis, useLenis} from 'lenis/react';
// import {useEffect, useRef} from 'react';

// export const LenisScroll = ({children}) => {
//   const lenisRef = useRef();

//   const lenis = useLenis(({scroll}) => {
//     console.log(scroll);
//   });

//   useEffect(() => {
//     function update(time) {
//       lenisRef.current?.lenis?.raf(time * 1000);
//       document.documentElement.style.setProperty('--scroll-y', scroll);
//     }

//     window.lenis = lenisRef?.current?.lenis;
//     gsap.ticker.add(update);

//     return () => gsap.ticker.remove(update);
//   }, []);

//   return (
//     <ReactLenis
//       root
//       options={{autoRaf: false, smoothTouch: true}}
//       ref={lenisRef}
//     >
//       {children}
//     </ReactLenis>
//   );
// };

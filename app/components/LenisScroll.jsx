import {ReactLenis, useLenis} from 'lenis/react';

const setScrollLock = () => {
  const content = window.lenis?.options.content;
  content?.style.setProperty('--scrollbar-gutter', `${getScrollbarWidth()}px`);
  window.lenis?.stop();
};

const clearScrollLock = () => {
  const content = window.lenis?.options.content;
  content?.style.removeProperty('--scrollbar-gutter');
  window.lenis?.start();
};

const getScrollbarWidth = () => {
  const wrapper = window.lenis?.options.wrapper;
  const content = window.lenis?.options.content;

  if (!wrapper || !content) {
    return;
  }

  return wrapper.innerWidth || wrapper.clientWidth - content.clientWidth;
};

export const LenisScroll = ({children}) => {
  let scrollPos = 0;

  const lenis = useLenis(({scroll}) => {
    const header = document.querySelector('header');

    if (header == null) return;

    if (scroll > scrollPos) {
      document.documentElement.classList.remove('header-visible');
      document.documentElement.classList.add('header-folded');
    }

    if (scroll + 4 < scrollPos) {
      document.documentElement.classList.add('header-visible');
      document.documentElement.classList.remove('header-folded');
    }

    document.documentElement.classList.toggle(
      'page-scrolled',
      scroll > header.offsetHeight,
    );

    scrollPos = scroll;
  });

  return <ReactLenis root>{children}</ReactLenis>;
};

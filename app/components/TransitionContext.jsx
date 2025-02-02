import {useLocation, useNavigate} from '@remix-run/react';
import {createContext, useContext, useEffect, useRef, useState} from 'react';
import gsap from 'gsap';

const transitionIn = (container) => {
  if (!container) return;
  gsap.to(container, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.inOut',
  });
};

const transitionTo = (container, navigate, href) => {
  const link = document.createElement('a');
  link.href = href;

  if (!container) return;

  //check if the link is external
  if (link.hostname != window.location.hostname) {
    navigate(href);
    return;
  }

  gsap.to(container, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.inOut',
    onComplete: () => {
      navigate(link.pathname);
    },
  });
};

export const TransitionContext = createContext({
  // containerRef: null,
  transitionContainer: null,
  setTransitionContainer: () => {},
  transitionIn: () => {},
  transitionTo: () => {},
});

export const TransitionProvider = ({children}) => {
  // const containerRef = useRef(null);
  const [transitionContainer, setTransitionContainer] = useState(null);
  const {pathname} = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    transitionIn(transitionContainer);
  }, [transitionContainer, pathname]);

  return (
    <TransitionContext.Provider
      value={{
        // containerRef: containerRef,
        transitionContainer: transitionContainer,
        setTransitionContainer: setTransitionContainer,
        transitionIn: () => transitionIn(transitionContainer),
        transitionTo: (href) =>
          transitionTo(transitionContainer, navigate, href),
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransitionContext = () => {
  return useContext(TransitionContext);
};

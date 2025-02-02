import {NavLink} from '@remix-run/react';
import {useTransitionContext} from './TransitionContext';
import gsap from 'gsap';

export const TransitionLink = ({children, ...props}) => {
  const {transitionTo} = useTransitionContext();

  const onClickCallback = (e) => {
    e.preventDefault();
    transitionTo(e.target.href);
  };

  return (
    <NavLink onClick={onClickCallback} {...props}>
      {children}
    </NavLink>
  );
};

import {NavLink} from '@remix-run/react';
import {useTransitionContext} from './TransitionContext';
import gsap from 'gsap';

export const TransitionLink = ({children, ...props}) => {
  const {transitionTo} = useTransitionContext();

  const onClickCallback = (e) => {
    e.preventDefault();
    const target = e.target.closest('a');
    transitionTo(target);
  };

  return (
    <NavLink onClick={onClickCallback} {...props}>
      {children}
    </NavLink>
  );
};

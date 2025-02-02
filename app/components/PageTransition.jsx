import {Outlet, useLocation} from '@remix-run/react';
import {AnimatePresence, motion} from 'motion/react';
import {useEffect, useState} from 'react';

export const PageTransition = ({className = 'min-h-svh', children, page}) => {
  const {pathname} = useLocation();

  if (page === 'product') {
    return <main className={className}>{children}</main>;
  }

  return (
    <motion.main
      className={className}
      key={pathname}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 1}}
    >
      {children}
    </motion.main>
  );
};

import {motion} from 'motion/react';

export const PageTransition = ({className = 'min-h-svh', children}) => {
  return (
    <motion.div
      className={className}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.5, delay: 0}}
      exit={{opacity: 0, duration: 0.5, delay: 0.5}}
    >
      {children}
    </motion.div>
  );
};

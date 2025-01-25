import {motion} from 'motion/react';

export const PageTransition = ({children}) => {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.5, delay: 0}}
      exit={{opacity: 0, duration: 0.5, delay: 0.5}}
    >
      {children}
    </motion.div>
  );
};

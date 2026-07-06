import { motion, AnimatePresence } from "framer-motion";

export function AnimatedList({ children }) {
  return <AnimatePresence>{children}</AnimatePresence>;
}

export function AnimatedItem({ children, id }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }} // 初始状态：透明 + 向下偏移
      animate={{ opacity: 1, y: 0 }} // 进入状态：完全显示
      exit={{ opacity: 0, x: -20 }} // 退出状态：向左滑出
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

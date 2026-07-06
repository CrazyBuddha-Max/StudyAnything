import { cn } from "../lib/utils";

export function ShimmerButton({ children, className, ...props }) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-lg px-4 py-2 text-sm font-medium text-white",
        "bg-blue-500 overflow-hidden",
        "transition-all duration-300 hover:scale-105 active:scale-95",
        // 光泽扫过效果
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:-translate-x-full hover:before:translate-x-full",
        "before:transition-transform before:duration-500",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

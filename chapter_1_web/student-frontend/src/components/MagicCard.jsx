import { useRef, useState } from "react";
import { cn } from "../lib/utils";

export function MagicCard({ children, className }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative bg-white rounded-xl shadow p-4 overflow-hidden",
        "transition-shadow duration-300 hover:shadow-lg",
        className,
      )}
    >
      {/* 鼠标光晕 */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(200px circle at ${position.x}px ${position.y}px, #3b82f6, transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

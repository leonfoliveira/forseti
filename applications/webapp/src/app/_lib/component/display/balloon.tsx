import { BalloonIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  color: string;
  onTopReached: () => void;
};

/**
 * Display a balloon that floats up the screen and calls onTopReached when it reaches the top.
 *
 * @param color - The color of the balloon
 * @param onTopReached - Callback function called when the balloon reaches the top of the screen
 */
export function Balloon({ color, onTopReached }: Props) {
  const balloonRef = useRef<SVGSVGElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(window.innerHeight);
    };

    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);

    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    return () => {
      window.removeEventListener("resize", updateScreenHeight);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const handleAnimationEnd = () => {
      onTopReached();
    };

    const balloon = balloonRef.current;
    if (balloon) {
      balloon.addEventListener("transitionend", handleAnimationEnd);
      return () => {
        balloon.removeEventListener("transitionend", handleAnimationEnd);
      };
    }
  }, [isAnimating, onTopReached]);

  return (
    <BalloonIcon
      ref={balloonRef}
      data-testid="balloon"
      className="pointer-events-none absolute right-4 z-50"
      style={{
        fill: color,
        stroke: color,
        bottom: isAnimating ? `${screenHeight + 100}px` : "-100px",
        transition: isAnimating
          ? "bottom 3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 3s ease-in-out"
          : "none",
        transform: isAnimating
          ? "translateX(-10px) rotate(5deg)"
          : "translateX(0) rotate(0deg)",
        animation: isAnimating ? "balloon-sway 3s ease-in-out" : "none",
      }}
      size={100}
      color={color}
    />
  );
}

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  animationType?: "scale" | "lift" | "glow" | "ripple";
}

export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      iconPosition = "left",
      animationType = "scale",
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
      primary:
        "bg-[#00843D] hover:bg-[#006830] text-white focus:ring-[#00843D] shadow-md hover:shadow-lg",
      secondary:
        "border-2 border-[#00843D] text-[#00843D] hover:bg-[#00843D] hover:text-white focus:ring-[#00843D]",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
      destructive:
        "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 shadow-md hover:shadow-lg",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const disabledClasses = "opacity-50 cursor-not-allowed";

    const animations = {
      scale: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
      },
      lift: {
        whileHover: { y: -2 },
        whileTap: { y: 0 },
      },
      glow: {
        whileHover: { boxShadow: "0 0 20px rgba(0, 132, 61, 0.5)" },
      },
      ripple: {
        whileTap: { scale: 0.98 },
      },
    };

    const { onClick, type, ...restProps } = props;

    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${
          sizeClasses[size]
        } ${disabled || isLoading ? disabledClasses : ""} ${className}`}
        disabled={disabled || isLoading}
        onClick={onClick as any}
        type={type}
        {...animations[animationType]}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && icon && iconPosition === "left" && icon}
        {children}
        {!isLoading && icon && iconPosition === "right" && icon}

        {/* Ripple effect overlay */}
        {animationType === "ripple" && (
          <motion.span
            className="absolute inset-0 bg-white/20 rounded-lg"
            initial={{ scale: 0, opacity: 1 }}
            whileTap={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

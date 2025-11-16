import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "hover-lift" | "hover-glow" | "hover-border";
  delay?: number;
}

export function AnimatedCard({
  children,
  onClick,
  className = "",
  variant = "hover-lift",
  delay = 0,
}: AnimatedCardProps) {
  const variants = {
    "hover-lift": {
      rest: { y: 0, boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" },
      hover: {
        y: -8,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      tap: { scale: 0.98 },
    },
    "hover-glow": {
      rest: { boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" },
      hover: {
        boxShadow: "0 0 30px rgba(0, 132, 61, 0.3)",
      },
      tap: { scale: 0.98 },
    },
    "hover-border": {
      rest: { borderColor: "rgba(229, 231, 235, 1)" },
      hover: {
        borderColor: "rgba(0, 132, 61, 1)",
      },
      tap: { scale: 0.98 },
    },
    default: {
      rest: {},
      hover: { scale: 1.02 },
      tap: { scale: 0.98 },
    },
  };

  return (
    <motion.div
      className={`bg-white rounded-lg border border-gray-200 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      variants={variants[variant]}
      whileHover="hover"
      whileTap={onClick ? "tap" : undefined}
      layout
    >
      {children}
    </motion.div>
  );
}

// Event Card with Color Strip
interface AnimatedEventCardProps {
  title: string;
  type: string;
  date: string;
  time?: string;
  location?: string;
  attendees?: string;
  color: "purple" | "blue" | "green" | "orange";
  onClick?: () => void;
  delay?: number;
}

export function AnimatedEventCard({
  title,
  type,
  date,
  time,
  location,
  attendees,
  color,
  onClick,
  delay = 0,
}: AnimatedEventCardProps) {
  const colorClasses = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
  };

  const badgeClasses = {
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300 }}
      whileHover={{
        y: -4,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={`h-2 ${colorClasses[color]}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <motion.span
            className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClasses[color]}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3, type: "spring" }}
          >
            {type}
          </motion.span>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        {(time || location || attendees) && (
          <div className="space-y-1 text-sm text-gray-600">
            {time && <p>⏰ {time}</p>}
            {location && <p>📍 {location}</p>}
            {attendees && <p>👥 {attendees}</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Progress Card with Animated Bar
interface AnimatedProgressCardProps {
  label: string;
  current: number;
  total: number;
  color: "purple" | "blue" | "green";
  delay?: number;
}

export function AnimatedProgressCard({
  label,
  current,
  total,
  color,
  delay = 0,
}: AnimatedProgressCardProps) {
  const percentage = (current / total) * 100;

  const colorClasses = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
  };

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring" }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <motion.span
          className="text-2xl font-bold text-gray-900"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 500 }}
        >
          {current}/{total}
        </motion.span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
        />
      </div>
      {percentage === 100 && (
        <motion.p
          className="text-sm text-green-600 mt-2 flex items-center gap-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 1.3 }}
        >
          ✓ Goal completed!
        </motion.p>
      )}
    </motion.div>
  );
}

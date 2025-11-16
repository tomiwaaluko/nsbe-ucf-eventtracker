import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Award, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "star" | "award";
  color: "gold" | "purple" | "blue" | "green";
}

interface AchievementUnlockedProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function AchievementUnlocked({
  achievement,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000,
}: AchievementUnlockedProps) {
  useEffect(() => {
    if (achievement && autoDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [achievement, autoDismiss, autoDismissDelay, onDismiss]);

  const icons = {
    trophy: Trophy,
    star: Star,
    award: Award,
  };

  const colors = {
    gold: {
      gradient: "from-yellow-400 to-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-900",
    },
    purple: {
      gradient: "from-purple-400 to-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-900",
    },
    blue: {
      gradient: "from-blue-400 to-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-900",
    },
    green: {
      gradient: "from-green-400 to-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-900",
    },
  };

  if (!achievement) return null;

  const Icon = icons[achievement.icon];
  const colorScheme = colors[achievement.color];

  return (
    <AnimatePresence>
      {achievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          {/* Confetti Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  delay: Math.random() * 0.5,
                  ease: "linear",
                }}
              >
                <div
                  className={`w-3 h-3 ${
                    [
                      "bg-yellow-400",
                      "bg-purple-500",
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-red-500",
                    ][i % 5]
                  }`}
                  style={{
                    borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Achievement Card */}
          <motion.div
            className="pointer-events-auto max-w-md w-full"
            initial={{ scale: 0, rotateY: -180, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0, rotateY: 180, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
          >
            <div
              className={`bg-white rounded-2xl border-2 ${colorScheme.border} shadow-2xl overflow-hidden`}
            >
              {/* Animated Banner */}
              <motion.div
                className={`h-2 bg-gradient-to-r ${colorScheme.gradient}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />

              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-2">
                  <motion.button
                    onClick={onDismiss}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </motion.button>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    className={`w-24 h-24 bg-gradient-to-br ${colorScheme.gradient} rounded-full flex items-center justify-center relative`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      delay: 0.2,
                    }}
                  >
                    <Icon className="h-12 w-12 text-white" />

                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                        delay: 0.5,
                      }}
                    />

                    {/* Pulse Ring */}
                    <motion.div
                      className={`absolute inset-0 rounded-full border-4 ${colorScheme.border}`}
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeOut",
                      }}
                    />
                  </motion.div>
                </div>

                {/* Text */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  >
                    Achievement Unlocked! 🎉
                  </motion.h3>
                  <h4
                    className={`text-xl font-semibold ${colorScheme.text} mb-2`}
                  >
                    {achievement.title}
                  </h4>
                  <p className="text-gray-600">{achievement.description}</p>
                </motion.div>

                {/* Stars */}
                <motion.div
                  className="flex justify-center gap-2 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.7 + i * 0.1,
                        type: "spring",
                        stiffness: 500,
                      }}
                    >
                      <Star
                        className={`h-6 w-6 fill-yellow-400 text-yellow-400`}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Mini notification version
interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementToast({
  achievement,
  onDismiss,
}: AchievementToastProps) {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  const icons = {
    trophy: Trophy,
    star: Star,
    award: Award,
  };

  const colors = {
    gold: "from-yellow-400 to-yellow-600",
    purple: "from-purple-400 to-purple-600",
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-green-600",
  };

  if (!achievement) return null;

  const Icon = icons[achievement.icon];

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-sm"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-center gap-3">
            <motion.div
              className={`w-12 h-12 bg-gradient-to-br ${
                colors[achievement.color]
              } rounded-full flex items-center justify-center flex-shrink-0`}
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Achievement Unlocked!
              </p>
              <p className="text-sm text-gray-600 truncate">
                {achievement.title}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing achievement notifications
export function useAchievementNotification() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  const showAchievement = (newAchievement: Achievement) => {
    setAchievement(newAchievement);
  };

  const dismissAchievement = () => {
    setAchievement(null);
  };

  return {
    achievement,
    showAchievement,
    dismissAchievement,
  };
}

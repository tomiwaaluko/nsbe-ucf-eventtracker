import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";

interface AchievementBadgeProps {
  title: string;
  description: string;
  unlocked: boolean;
  icon?: React.ReactNode;
  color?: string;
}

export function AchievementBadge({
  title,
  description,
  unlocked,
  icon,
  color = "#00a651",
}: AchievementBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative p-6 rounded-xl border-2 transition-all ${
        unlocked
          ? "bg-white border-gray-200 shadow-md hover:shadow-lg"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      {!unlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={`p-4 rounded-full ${
            unlocked ? "bg-opacity-10" : "bg-gray-200"
          }`}
          style={unlocked ? { backgroundColor: `${color}20` } : {}}
        >
          {unlocked ? (
            <div style={{ color }}>{icon || <Award className="w-8 h-8" />}</div>
          ) : (
            <div className="text-gray-400">
              {icon || <Award className="w-8 h-8" />}
            </div>
          )}
        </div>

        <div>
          <h5 className={unlocked ? "text-gray-900" : "text-gray-500"}>
            {title}
          </h5>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1"
        >
          <Award className="w-4 h-4" />
        </motion.div>
      )}
    </motion.div>
  );
}

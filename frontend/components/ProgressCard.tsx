import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  category: "workshops" | "gbm" | "community";
  color: string;
  icon: React.ReactNode;
}

export function ProgressCard({
  title,
  current,
  target,
  category,
  color,
  icon,
}: ProgressCardProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <div>
            <h4 className="text-gray-900">{title}</h4>
            <p className="text-sm text-gray-500">
              {current} of {target} completed
            </p>
          </div>
        </div>
        {isComplete && (
          <CheckCircle2
            className="w-6 h-6 text-green-500"
            aria-label="Goal completed"
          />
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Progress indicators */}
        <div className="flex gap-1">
          {Array.from({ length: target }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i < current ? color : "#e5e7eb",
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {percentage.toFixed(0)}% Complete
        </span>
        {!isComplete && (
          <span className="text-xs text-gray-500">
            {target - current} more needed
          </span>
        )}
      </div>
    </motion.div>
  );
}

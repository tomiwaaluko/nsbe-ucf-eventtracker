import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedTableProps {
  headers: string[];
  data: Array<Record<string, ReactNode>>;
  onRowClick?: (row: Record<string, ReactNode>) => void;
}

export function AnimatedTable({
  headers,
  data,
  onRowClick,
}: AnimatedTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <motion.tr
              className="bg-gray-50 border-b border-gray-200"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {headers.map((header, index) => (
                <motion.th
                  key={header}
                  className="text-left py-3 px-4 font-semibold text-gray-900 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {header}
                </motion.th>
              ))}
            </motion.tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                className={`border-b border-gray-100 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(row)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + rowIndex * 0.05 }}
                whileHover={{
                  backgroundColor: "rgba(249, 250, 251, 1)",
                  transition: { duration: 0.2 },
                }}
              >
                {headers.map((header, cellIndex) => (
                  <motion.td
                    key={cellIndex}
                    className="py-3 px-4 text-sm text-gray-700"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {row[header.toLowerCase()]}
                  </motion.td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Row Hover Animation
export function AnimatedTableRow({
  children,
  onClick,
  delay = 0,
}: {
  children: ReactNode;
  onClick?: () => void;
  delay?: number;
}) {
  return (
    <motion.tr
      className={`border-b border-gray-100 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{
        backgroundColor: "rgba(249, 250, 251, 1)",
        x: 4,
      }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {children}
    </motion.tr>
  );
}

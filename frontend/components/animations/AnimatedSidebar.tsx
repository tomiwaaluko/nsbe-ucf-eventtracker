import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  QrCode,
  Award,
  Settings,
  Shield,
  Users,
  X,
  ChevronRight,
} from "lucide-react";
import { ReactNode } from "react";

interface AnimatedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole?: string;
  userName?: string;
}

export function AnimatedSidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  userRole = "member",
  userName = "Member",
}: AnimatedSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, section: "main" },
    { id: "events", label: "Events", icon: Calendar, section: "main" },
    { id: "check-in", label: "Check In", icon: QrCode, section: "main" },
    { id: "achievements", label: "Achievements", icon: Award, section: "main" },
  ];

  const adminItems = [
    { id: "admin-dashboard", label: "Admin Dashboard", icon: Shield },
    { id: "event-management", label: "Manage Events", icon: Calendar },
    { id: "member-management", label: "Manage Members", icon: Users },
  ];

  const isAdmin = userRole === "admin" || userRole === "super_admin";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#00843D] to-[#006830] text-white shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <motion.div
                className="p-6 border-b border-white/10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 bg-white rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-2xl font-bold text-[#00843D]">
                        N
                      </span>
                    </motion.div>
                    <div>
                      <h2 className="font-bold text-lg">NSBE UCF</h2>
                      <p className="text-xs text-white/80">Event Tracker</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* User Info */}
                <motion.div
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                >
                  <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <span className="font-bold text-gray-900">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{userName}</p>
                    <p className="text-xs text-white/70 capitalize">
                      {userRole}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/50" />
                </motion.div>
              </motion.div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Main Menu */}
                {menuItems.map((item, index) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentPage === item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    delay={0.1 + index * 0.05}
                  />
                ))}

                {/* Admin Section */}
                {isAdmin && (
                  <>
                    <motion.div
                      className="pt-4 pb-2 px-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Admin
                      </p>
                    </motion.div>
                    {adminItems.map((item, index) => (
                      <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={currentPage === item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          onClose();
                        }}
                        delay={0.4 + index * 0.05}
                      />
                    ))}
                  </>
                )}

                {/* Settings */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <SidebarItem
                    icon={Settings}
                    label="Settings"
                    isActive={currentPage === "settings"}
                    onClick={() => {
                      onNavigate("settings");
                      onClose();
                    }}
                    delay={0.5}
                  />
                </motion.div>
              </nav>

              {/* Footer */}
              <motion.div
                className="p-4 border-t border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs text-white/60 text-center">
                  NSBE UCF © 2024
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Sidebar Item Component
interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  delay: number;
}

function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  delay,
}: SidebarItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-white text-[#00843D] shadow-lg"
          : "text-white hover:bg-white/10"
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ x: isActive ? 0 : 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        animate={isActive ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Icon className="h-5 w-5" />
      </motion.div>
      <span className="font-medium">{label}</span>
      {isActive && (
        <motion.div
          className="ml-auto w-2 h-2 bg-[#00843D] rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        />
      )}
    </motion.button>
  );
}

// Collapsible Sidebar Item (for submenus)
interface CollapsibleSidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  delay: number;
}

export function CollapsibleSidebarItem({
  icon: Icon,
  label,
  isOpen,
  onToggle,
  children,
  delay,
}: CollapsibleSidebarItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium flex-1 text-left">{label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ml-4 mt-1 space-y-1"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

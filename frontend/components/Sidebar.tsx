import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  QrCode,
  Award,
  LogOut,
  UserCheck,
  ClipboardList,
  Shield,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole?: "member" | "admin" | "super_admin" | "officer";
  userName?: string;
  onLogout?: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    roles: ["member", "officer", "admin", "super_admin"],
    section: "main",
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    roles: ["member", "officer", "admin", "super_admin"],
    section: "main",
  },
  {
    id: "attendance",
    label: "Check In",
    icon: QrCode,
    roles: ["member", "officer", "admin", "super_admin"],
    section: "main",
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Award,
    roles: ["member", "officer", "admin", "super_admin"],
    section: "main",
  },

  // Admin Section
  {
    id: "admin-dashboard",
    label: "Admin Dashboard",
    icon: Shield,
    roles: ["admin", "super_admin"],
    section: "admin",
  },
  {
    id: "admin-events",
    label: "Manage Events",
    icon: Calendar,
    roles: ["admin", "super_admin"],
    section: "admin",
  },
  {
    id: "admin-members",
    label: "Manage Members",
    icon: Users,
    roles: ["admin", "super_admin"],
    section: "admin",
  },
  {
    id: "admin-checkin",
    label: "Manual Check-In",
    icon: UserCheck,
    roles: ["admin", "super_admin", "officer"],
    section: "admin",
  },
  {
    id: "admin-attendance",
    label: "Attendance Logs",
    icon: ClipboardList,
    roles: ["admin", "super_admin"],
    section: "admin",
  },

  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    roles: ["member", "officer", "admin", "super_admin"],
    section: "main",
  },
];

export function Sidebar({
  currentPage,
  onNavigate,
  userRole = "member",
  userName = "Member",
  onLogout,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src="/nsbe-logo.png"
              alt="NSBE Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="text-gray-900">NSBE UCF</h3>
            <p className="text-xs text-gray-500">Event Tracker</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200" suppressHydrationWarning>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00a651] flex items-center justify-center">
            <span className="text-white" suppressHydrationWarning>
              {userName && userName.length > 0
                ? userName.charAt(0).toUpperCase()
                : "M"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm text-gray-900 truncate"
              suppressHydrationWarning
            >
              {userName}
            </p>
            <p
              className="text-xs text-gray-500 capitalize"
              suppressHydrationWarning
            >
              {userRole}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Section */}
        {filteredMenuItems
          .filter((item) => item.section === "main")
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#00a651] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

        {/* Admin Section */}
        {filteredMenuItems.some((item) => item.section === "admin") && (
          <>
            <div className="pt-4 pb-2 px-2">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Administration
              </p>
            </div>
            {filteredMenuItems
              .filter((item) => item.section === "admin")
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#00a651] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              console.log("Logout");
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col fixed left-0 top-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-white z-50 shadow-xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

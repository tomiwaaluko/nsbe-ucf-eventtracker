import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  Users,
  Settings,
  QrCode,
  Award,
  LogOut,
  UserCheck,
  ClipboardList,
  Shield,
  Construction,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Bricolage_Grotesque, Sora } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole?: "member" | "admin" | "super_admin";
  userName?: string;
  onLogout?: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    roles: ["member", "admin", "super_admin"],
    section: "main",
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    roles: ["member", "admin", "super_admin"],
    section: "main",
  },
  {
    id: "attendance",
    label: "Check In",
    icon: QrCode,
    roles: ["member", "admin", "super_admin"],
    section: "main",
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Award,
    roles: ["member", "admin", "super_admin"],
    section: "main",
    wip: true,
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
    roles: ["admin", "super_admin"],
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
    id: "admin-admins",
    label: "Manage Admins",
    icon: Shield,
    roles: ["super_admin"],
    section: "admin",
  },

  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    roles: ["member", "admin", "super_admin"],
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
  const [mounted, setMounted] = useState(false);

  // Only render admin section after hydration to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const hasAdminItems = filteredMenuItems.some((item) => item.section === "admin");

  return (
    <>
      {/* Desktop sidebar only - mobile uses TopBar */}
      <aside
        className={`hidden lg:flex w-80 bg-white border-r-4 border-black flex-col h-screen sticky top-0 ${bricolage.variable} ${sora.variable}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b-4 border-black">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                <div className="relative w-10 h-10 bg-[#00a651] border-2 border-black flex items-center justify-center overflow-hidden">
                  <Image
                    src="/nsbe-logo.png"
                    alt="NSBE Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <h3
                  className={`text-black font-extrabold ${bricolage.className}`}
                >
                  NSBE UCF
                </h3>
                <p className={`text-xs text-black/60 ${sora.className}`}>
                  Event Tracker
                </p>
              </div>
            </div>
          </div>

          {/* User info */}
          <div
            className="p-4 border-b-4 border-black"
            suppressHydrationWarning
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                <div className="relative w-10 h-10 bg-[#00a651] border-2 border-black flex items-center justify-center">
                  <span
                    className={`text-white font-bold text-sm ${bricolage.className}`}
                    suppressHydrationWarning
                  >
                    {userName && userName.length > 0
                      ? userName.charAt(0).toUpperCase()
                      : "M"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold text-black truncate ${bricolage.className}`}
                  suppressHydrationWarning
                >
                  {userName}
                </p>
                <p
                  className={`text-xs text-black/60 capitalize ${sora.className}`}
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
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    whileHover={
                      !isActive
                        ? {
                            x: 2,
                            y: -2,
                            transition: { duration: 0.2 },
                          }
                        : {}
                    }
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full"
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                    )}
                    <div
                      className={`relative flex items-center gap-3 px-4 py-3 border-2 border-black transition-all ${
                        isActive
                          ? "bg-[#00a651] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                          : "bg-white text-black hover:bg-black/5"
                      } ${(item as { wip?: boolean }).wip ? "opacity-90" : ""}`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span
                        className={`font-bold ${bricolage.className} ${
                          isActive ? "text-white" : "text-black"
                        }`}
                      >
                        {item.label}
                      </span>
                      {(item as { wip?: boolean }).wip && (
                        <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 border border-amber-600/50 text-amber-800 text-[10px] font-bold uppercase">
                          <Construction className="w-3 h-3" />
                          WIP
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}

            {/* Admin Section */}
            {mounted && hasAdminItems && (
              <>
                <div className="pt-4 pb-2 px-2">
                  <p
                    className={`text-xs uppercase tracking-wider text-black/60 font-bold ${bricolage.className}`}
                  >
                    Administration
                  </p>
                </div>
                {filteredMenuItems
                  .filter((item) => item.section === "admin")
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        whileHover={
                          !isActive
                            ? {
                                x: 2,
                                y: -2,
                                transition: { duration: 0.2 },
                              }
                            : {}
                        }
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full"
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                        )}
                        <div
                          className={`relative flex items-center gap-3 px-4 py-3 border-2 border-black transition-all ${
                            isActive
                              ? "bg-[#00a651] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                              : "bg-white text-black hover:bg-black/5"
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span
                            className={`font-bold ${bricolage.className} ${
                              isActive ? "text-white" : "text-black"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t-4 border-black">
            <motion.button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                }
              }}
              whileHover={{
                x: 2,
                y: -2,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full"
            >
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
              <div className="relative flex items-center gap-3 px-4 py-3 bg-white border-2 border-black hover:bg-red-50 transition-colors">
                <LogOut className="w-5 h-5 text-[#ed1c24]" />
                <span
                  className={`font-bold text-[#ed1c24] ${bricolage.className}`}
                >
                  Logout
                </span>
              </div>
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
}

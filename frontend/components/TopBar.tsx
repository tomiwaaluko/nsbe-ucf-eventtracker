"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  Users,
  Menu,
  X,
  QrCode,
  Award,
  LogOut,
  UserCheck,
  ClipboardList,
  Shield,
  Settings,
  Construction,
  Trophy,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useChangelogUnread } from "@/lib/changelog";
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

interface TopBarProps {
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
    id: "friends",
    label: "Friends",
    icon: Users,
    roles: ["member", "admin", "super_admin"],
    section: "main",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: Trophy,
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
    id: "changelog",
    label: "What's new",
    icon: Sparkles,
    roles: ["member", "admin", "super_admin"],
    section: "main",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    roles: ["member", "admin", "super_admin"],
    section: "main",
  },
];

const NavLink = ({
  item,
  isActive,
  onNavigate,
  onClose,
  showUnreadDot = false,
}: {
  item: (typeof menuItems)[0] & { wip?: boolean };
  isActive: boolean;
  onNavigate: (page: string) => void;
  onClose: () => void;
  showUnreadDot?: boolean;
}) => {
  const Icon = item.icon;
  return (
    <motion.button
      key={item.id}
      onClick={() => {
        onNavigate(item.id);
        onClose();
      }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-black transition-all text-left ${
        isActive
          ? "bg-[#00a651] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          : "bg-white text-black hover:bg-black/5"
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className={`font-bold ${bricolage.className}`}>{item.label}</span>
      {item.wip && (
        <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 border border-amber-600/50 text-amber-800 text-[10px] font-bold uppercase">
          <Construction className="w-3 h-3" />
          WIP
        </span>
      )}
      {showUnreadDot && (
        <span
          className={`${item.wip ? "" : "ml-auto"} w-2.5 h-2.5 rounded-full bg-[#ed1c24] border border-black flex-shrink-0`}
          aria-label="Unread updates"
        />
      )}
    </motion.button>
  );
};

export function TopBar({
  currentPage,
  onNavigate,
  userRole = "member",
  userName = "Member",
  onLogout,
}: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasUnreadChangelog = useChangelogUnread();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );
  const mainItems = filteredMenuItems.filter((item) => item.section === "main");
  const adminItems = filteredMenuItems.filter((item) => item.section === "admin");

  return (
    <>
      {/* Top bar - fixed at viewport top */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black shadow-md ${bricolage.variable} ${sora.variable}`}
      >
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          {/* Left: Logo + Hamburger (mobile) or Nav (desktop) */}
          <div className="flex items-center gap-3">
            {/* Hamburger - always at top, min 44px touch target */}
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 p-2 touch-manipulation"
              aria-label="Toggle menu"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                <div className="relative bg-[#00a651] border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-2">
                  {menuOpen ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
            </motion.button>

            {/* Logo + Title */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-0.5 translate-y-0.5" />
                <div className="relative w-9 h-9 bg-[#00a651] border-2 border-black flex items-center justify-center overflow-hidden">
                  <Image
                    src="/nsbe-logo.png"
                    alt="NSBE Logo"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <h3 className={`text-black font-extrabold text-sm ${bricolage.className}`}>
                  NSBE UCF
                </h3>
                <p className={`text-[10px] text-black/60 ${sora.className}`}>
                  Event Tracker
                </p>
              </div>
            </div>
          </div>

          {/* Desktop nav - horizontal */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const wip = (item as { wip?: boolean }).wip;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 border-black transition-all ${
                    isActive
                      ? "bg-[#00a651] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                      : "bg-white text-black hover:bg-black/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={`font-bold text-sm ${bricolage.className}`}>
                    {item.label}
                  </span>
                  {wip && (
                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-amber-100 border border-amber-600/50 text-amber-800 text-[9px] font-bold uppercase">
                      <Construction className="w-2.5 h-2.5" />
                      WIP
                    </span>
                  )}
                  {item.id === "changelog" && hasUnreadChangelog && (
                    <span
                      className="w-2 h-2 rounded-full bg-[#ed1c24] border border-black flex-shrink-0"
                      aria-label="Unread updates"
                    />
                  )}
                </motion.button>
              );
            })}
            {mounted && adminItems.length > 0 && (
              <>
                <span className="w-px h-6 bg-black/20 mx-1" />
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 border-black transition-all ${
                        isActive
                          ? "bg-[#00a651] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                          : "bg-white text-black hover:bg-black/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className={`font-bold text-xs ${bricolage.className}`}>
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </>
            )}
          </nav>

          {/* Right: User + Logout (desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00a651] border-2 border-black flex items-center justify-center rounded">
                <span
                  className={`text-white font-bold text-xs ${bricolage.className}`}
                  suppressHydrationWarning
                >
                  {userName?.charAt(0)?.toUpperCase() || "M"}
                </span>
              </div>
              <div className="text-left">
                <p
                  className={`text-sm font-bold text-black truncate max-w-[120px] ${bricolage.className}`}
                  suppressHydrationWarning
                >
                  {userName}
                </p>
                <p
                  className={`text-[10px] text-black/60 capitalize ${sora.className}`}
                  suppressHydrationWarning
                >
                  {userRole}
                </p>
              </div>
            </div>
            <motion.button
              onClick={onLogout}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-black hover:bg-red-50 transition-colors rounded-md"
            >
              <LogOut className="w-4 h-4 text-[#ed1c24]" />
              <span className={`font-bold text-[#ed1c24] text-sm ${bricolage.className}`}>
                Logout
              </span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu - opens below top bar */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 top-14"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 right-0 top-14 z-50 bg-white border-b-4 border-black shadow-lg max-h-[calc(100vh-3.5rem)] overflow-y-auto"
            >
              <div className="p-4 space-y-2">
                {/* User info */}
                <div
                  className="flex items-center gap-3 p-3 bg-black/5 rounded-lg border-2 border-black/20 mb-4"
                  suppressHydrationWarning
                >
                  <div className="w-10 h-10 bg-[#00a651] border-2 border-black flex items-center justify-center rounded">
                    <span
                      className={`text-white font-bold text-sm ${bricolage.className}`}
                      suppressHydrationWarning
                    >
                      {userName?.charAt(0)?.toUpperCase() || "M"}
                    </span>
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

                {mainItems.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    isActive={currentPage === item.id}
                    onNavigate={onNavigate}
                    onClose={() => setMenuOpen(false)}
                    showUnreadDot={
                      item.id === "changelog" && hasUnreadChangelog
                    }
                  />
                ))}

                {mounted && adminItems.length > 0 && (
                  <>
                    <div className="pt-4 pb-2 px-2">
                      <p
                        className={`text-xs uppercase tracking-wider text-black/60 font-bold ${bricolage.className}`}
                      >
                        Administration
                      </p>
                    </div>
                    {adminItems.map((item) => (
                      <NavLink
                        key={item.id}
                        item={item}
                        isActive={currentPage === item.id}
                        onNavigate={onNavigate}
                        onClose={() => setMenuOpen(false)}
                      />
                    ))}
                  </>
                )}

                <motion.button
                  onClick={() => {
                    onLogout?.();
                    setMenuOpen(false);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-black hover:bg-red-50 transition-colors text-left mt-4"
                >
                  <LogOut className="w-5 h-5 text-[#ed1c24]" />
                  <span
                    className={`font-bold text-[#ed1c24] ${bricolage.className}`}
                  >
                    Logout
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

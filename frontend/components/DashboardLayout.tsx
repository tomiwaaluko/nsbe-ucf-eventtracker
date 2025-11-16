"use client";

import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize user data from localStorage
  const getUserData = () => {
    if (typeof window === "undefined")
      return { name: "Member", role: "member" as const };

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        name: `${user.firstName} ${user.lastName}`,
        role: (user.role || "member") as
          | "member"
          | "admin"
          | "super_admin"
          | "officer",
      };
    }
    return { name: "Member", role: "member" as const };
  };

  const [userData] = useState(getUserData);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  const getCurrentPage = () => {
    // Map pathname to sidebar menu item IDs
    const path = pathname.split("/")[1] || "dashboard";

    // Map routes to menu IDs
    const routeMap: Record<string, string> = {
      dashboard: "dashboard",
      events: "events",
      attendance: "attendance",
      checkin: "attendance",
      achievements: "achievements",
      settings: "settings",
      admin: "admin-dashboard",
      members: "member-management",
    };

    return routeMap[path] || "dashboard";
  };

  const handleNavigate = (page: string) => {
    const navigationMap: Record<string, string> = {
      dashboard: "/dashboard",
      events: "/events",
      attendance: "/attendance",
      achievements: "/achievements",
      settings: "/settings",
      "admin-dashboard": "/admin",
      "event-management": "/admin/events",
      "member-management": "/admin/members",
      "manual-checkin": "/admin/checkin",
      "attendance-logs": "/admin/attendance",
    };

    const route = navigationMap[page] || `/${page}`;
    router.push(route);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentPage={getCurrentPage()}
        onNavigate={handleNavigate}
        userRole={userData.role}
        userName={userData.name}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-72">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}

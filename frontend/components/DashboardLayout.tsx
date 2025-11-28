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
    const pathParts = pathname.split("/").filter(Boolean);
    const firstPath = pathParts[0] || "dashboard";
    const secondPath = pathParts[1];

    // Handle admin routes
    if (firstPath === "admin") {
      if (!secondPath) return "admin-dashboard";
      return `admin-${secondPath}`;
    }

    // Map routes to menu IDs
    const routeMap: Record<string, string> = {
      dashboard: "dashboard",
      events: "events",
      attendance: "attendance",
      checkin: "attendance",
      achievements: "achievements",
      settings: "settings",
    };

    return routeMap[firstPath] || "dashboard";
  };

  const handleNavigate = (page: string) => {
    // Handle admin routes
    if (page.startsWith("admin-")) {
      if (page === "admin-dashboard") {
        router.push("/admin");
      } else {
        const adminPage = page.replace("admin-", "");
        router.push(`/admin/${adminPage}`);
      }
      return;
    }

    const navigationMap: Record<string, string> = {
      dashboard: "/dashboard",
      events: "/events",
      attendance: "/attendance",
      achievements: "/achievements",
      settings: "/settings",
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
    <div className="flex min-h-screen">
      <Sidebar
        currentPage={getCurrentPage()}
        onNavigate={handleNavigate}
        userRole={userData.role}
        userName={userData.name}
        onLogout={handleLogout}
      />

      {/* Main content with gradient background */}
      <main className="flex-1 bg-gradient-to-br from-[#006830] via-[#008a44] to-[#00a651] overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}

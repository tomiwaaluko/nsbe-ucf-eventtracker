"use client";

import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
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
        role: (user.role || "member") as "member" | "admin" | "super_admin",
      };
    }
    return { name: "Member", role: "member" as const };
  };

  const [userData, setUserData] = useState(getUserData);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    // Update user data from localStorage whenever the component mounts or pathname changes
    const updatedUserData = getUserData();
    setUserData(updatedUserData);
  }, [router, pathname]);

  // Add a storage event listener to update when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUserData = getUserData();
      setUserData(updatedUserData);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
      {/* Desktop: Sidebar (lg and up) */}
      <Sidebar
        currentPage={getCurrentPage()}
        onNavigate={handleNavigate}
        userRole={userData.role}
        userName={userData.name}
        onLogout={handleLogout}
      />

      {/* Mobile: Top bar with hamburger fixed at viewport top */}
      <div className="lg:hidden">
        <TopBar
          currentPage={getCurrentPage()}
          onNavigate={handleNavigate}
          userRole={userData.role}
          userName={userData.name}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content: pt-14 on mobile for top bar, no extra padding on desktop */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

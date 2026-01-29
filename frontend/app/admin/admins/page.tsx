"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Shield, UserPlus, Mail, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ManageAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("member");
  const [addEmail, setAddEmail] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "super_admin") {
          router.push("/admin");
          return;
        }
      } catch {
        // ignore
      }
    }
    fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      const [adminData, meData] = await Promise.all([
        api.getAdmins(token),
        api.getMe(token),
      ]);
      setAdmins(adminData);
      if (meData?.role) setUserRole(meData.role);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      toast.error("Failed to load admins");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByEmail = async () => {
    if (!addEmail.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const results = await api.searchMembers(token, addEmail.trim());
      const list = Array.isArray(results) ? results : [];
      const match = list.find(
        (m: any) => m.email?.toLowerCase() === addEmail.trim().toLowerCase()
      );
      setSearchResult(match || (list[0] ?? null));
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleMakeAdmin = async (memberId: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await api.updateMemberRole(token, memberId, "admin");
      toast.success("User set as admin");
      setAddEmail("");
      setSearchResult(null);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message || "Failed to add admin");
    } finally {
      setUpdating(false);
    }
  };

  const handleDemoteToMember = async (memberId: string) => {
    if (userRole !== "super_admin") return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await api.updateMemberRole(token, memberId, "member");
      toast.success("User demoted to member");
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message || "Failed to demote");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830] p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white">Manage Admins</h2>
            <p className="text-white/80 mt-1">
              Add or remove admins by email. Admins can use Manual Check-In and view admin pages.
            </p>
          </div>

          {userRole === "super_admin" && (
            <Card className="p-6 mb-6 bg-white/10 backdrop-blur-md border-white/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add admin by email
              </h3>
              <div className="flex gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="email" className="text-white/90 sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={addEmail}
                    onChange={(e) => {
                      setAddEmail(e.target.value);
                      setSearchResult(null);
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <Button
                  onClick={handleSearchByEmail}
                  disabled={searching || !addEmail.trim()}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/20"
                >
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>
              {searchResult && (
                <div className="mt-4 p-4 rounded-lg bg-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-white/70" />
                    <div>
                      <p className="text-white font-medium">
                        {[searchResult.firstName, searchResult.lastName]
                          .filter(Boolean)
                          .join(" ") || "No name"}
                      </p>
                      <p className="text-white/70 text-sm">{searchResult.email}</p>
                      {searchResult.role && (
                        <p className="text-white/60 text-xs capitalize">
                          Current role: {searchResult.role}
                        </p>
                      )}
                    </div>
                  </div>
                  {(searchResult.role === "member" || !searchResult.role) && (
                    <Button
                      onClick={() => handleMakeAdmin(searchResult.id)}
                      disabled={updating}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      {updating ? "Updating..." : "Make admin"}
                    </Button>
                  )}
                  {searchResult.role === "admin" && (
                    <span className="text-white/80 text-sm">Already admin</span>
                  )}
                  {searchResult.role === "super_admin" && (
                    <span className="text-white/80 text-sm">Super admin</span>
                  )}
                </div>
              )}
            </Card>
          )}

          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Current admins
            </h3>
            {admins.length === 0 ? (
              <p className="text-white/70">No admins yet.</p>
            ) : (
              <ul className="space-y-3">
                {admins.map((admin: any) => {
                  const name =
                    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
                    admin.email ||
                    "Unknown";
                  return (
                    <li
                      key={admin.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div>
                        <p className="text-white font-medium">{name}</p>
                        <p className="text-white/70 text-sm">{admin.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            admin.role === "super_admin"
                              ? "bg-purple-500/30 text-purple-200"
                              : "bg-white/20 text-white"
                          }`}
                        >
                          {admin.role === "super_admin" ? "Super admin" : "Admin"}
                        </span>
                        {userRole === "super_admin" &&
                          admin.role === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemoteToMember(admin.id)}
                              disabled={updating}
                              className="border-white/30 text-white/90 hover:bg-white/10"
                            >
                              <UserMinus className="w-4 h-4 mr-1" />
                              Demote
                            </Button>
                          )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

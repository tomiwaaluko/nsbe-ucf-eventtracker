"use client";

import { PointsManagement } from "@/components/PointsManagement";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { PointTypesMap, LeaderboardEntry, PointEntry } from "@/lib/api";
import { toast } from "sonner";

export default function PointsPage() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [pointTypes, setPointTypes] = useState<PointTypesMap>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [manualEntries, setManualEntries] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [lb, entries] = await Promise.all([
        api.getPointsLeaderboard(token, selectedSemester),
        api.getManualPointEntries(token, selectedSemester),
      ]);
      setLeaderboard(lb);
      setManualEntries(entries);
    } catch (error) {
      console.error("Failed to refresh points data:", error);
    }
  }, [selectedSemester]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const [semesterList, types] = await Promise.all([
          api.getPointsSemesters(token),
          api.getPointTypes(token),
        ]);

        setSemesters(semesterList);
        setPointTypes(types);

        if (semesterList.length > 0) {
          setSelectedSemester(semesterList[0]);
        }
      } catch (error) {
        console.error("Failed to fetch points init data:", error);
        toast.error("Failed to load points data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    if (!selectedSemester) return;
    fetchAllData();
  }, [selectedSemester, fetchAllData]);

  const handleBulkAward = async (payload: {
    memberIds: string[];
    pointTypeKey: string;
    semester: string;
    label?: string;
    note?: string;
  }) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const result = await api.bulkAwardPoints(token, payload);
      toast.success(
        `${result.awarded} awarded, ${result.skipped} already existed, ${result.notFound} not found`
      );
      await fetchAllData();
    } catch (error) {
      console.error("Failed to bulk award points:", error);
      toast.error("Failed to award points");
    }
  };

  const handleResolveMembers = async (lines: string[]) => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      return await api.resolveMembers(token, lines);
    } catch (error) {
      console.error("Failed to resolve members:", error);
      toast.error("Failed to resolve members");
      return null;
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.deletePointEntry(token, id);
      toast.success("Entry deleted");
      await fetchAllData();
    } catch (error) {
      console.error("Failed to delete point entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading points...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PointsManagement
        semesters={semesters}
        selectedSemester={selectedSemester}
        onSemesterChange={setSelectedSemester}
        pointTypes={pointTypes}
        leaderboard={leaderboard}
        manualEntries={manualEntries}
        onBulkAward={handleBulkAward}
        onResolveMembers={handleResolveMembers}
        onDeleteEntry={handleDeleteEntry}
        onRefresh={fetchAllData}
        token={token}
      />
    </DashboardLayout>
  );
}

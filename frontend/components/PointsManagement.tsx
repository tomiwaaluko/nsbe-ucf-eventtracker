"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  X,
  Loader2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import type { LeaderboardEntry, PointEntry, PointTypesMap, ResolvedMembersResult } from "@/lib/api";

interface PointsManagementProps {
  semesters: string[];
  selectedSemester: string;
  onSemesterChange: (s: string) => void;
  pointTypes: PointTypesMap;
  leaderboard: LeaderboardEntry[];
  manualEntries: PointEntry[];
  onBulkAward: (payload: any) => Promise<void>;
  onResolveMembers: (lines: string[]) => Promise<ResolvedMembersResult | null>;
  onDeleteEntry: (id: string) => Promise<void>;
  onRefresh: () => void;
  token: string;
}

type ActiveTab = "leaderboard" | "bulk" | "history";

const RANK_STYLES: Record<number, { badge: string; text: string }> = {
  1: { badge: "bg-yellow-400/30 text-yellow-300 border border-yellow-400/50", text: "font-bold text-yellow-300" },
  2: { badge: "bg-gray-300/30 text-gray-200 border border-gray-300/50", text: "font-bold text-gray-200" },
  3: { badge: "bg-orange-400/30 text-orange-300 border border-orange-400/50", text: "font-bold text-orange-300" },
};

export function PointsManagement({
  semesters,
  selectedSemester,
  onSemesterChange,
  pointTypes,
  leaderboard,
  manualEntries,
  onBulkAward,
  onResolveMembers,
  onDeleteEntry,
  onRefresh,
  token,
}: PointsManagementProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("leaderboard");
  const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(null);
  const [memberDetail, setMemberDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!selectedMember) {
      setMemberDetail(null);
      return;
    }
    setDetailLoading(true);
    api
      .getMemberPoints(token, selectedMember.memberId, selectedSemester)
      .then(setMemberDetail)
      .catch(() => setMemberDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedMember, token, selectedSemester]);

  const memberManualEntries = selectedMember
    ? manualEntries.filter((e) => e.memberId === selectedMember.memberId)
    : [];

  const autoPointTypes = Object.entries(pointTypes).filter(
    ([, pt]) => pt.autoSource !== null
  );

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "leaderboard", label: "Overview" },
    { key: "bulk", label: "Bulk Award" },
    { key: "history", label: "Entry History" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#ffb81c]" />
            <div>
              <h2 className="text-3xl font-bold text-white">Points Management</h2>
              <p className="text-white/80 mt-1">Track and manage member points by semester</p>
            </div>
          </div>
        </motion.div>

        {/* Semester Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 overflow-hidden flex items-center gap-4"
        >
          <label className="text-sm text-white/80 font-medium whitespace-nowrap">
            Semester
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-colors"
          >
            {semesters.length === 0 && (
              <option value="" disabled>
                No semesters available
              </option>
            )}
            {semesters.map((s) => (
              <option key={s} value={s} className="bg-[#006830] text-white">
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            className="ml-auto text-xs text-white/60 hover:text-white transition-colors underline underline-offset-2"
          >
            Refresh
          </button>
        </motion.div>

        {/* Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="flex border-b border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "text-white border-b-2 border-[#ffb81c] bg-white/10"
                    : "text-white/60 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "leaderboard" && (
              <LeaderboardTab
                leaderboard={leaderboard}
                onRowClick={setSelectedMember}
              />
            )}
            {activeTab === "bulk" && (
              <BulkAwardTab
                pointTypes={pointTypes}
                semesters={semesters}
                selectedSemester={selectedSemester}
                onBulkAward={onBulkAward}
                onResolveMembers={onResolveMembers}
                token={token}
              />
            )}
            {activeTab === "history" && (
              <EntryHistoryTab
                manualEntries={manualEntries}
                pointTypes={pointTypes}
                onDeleteEntry={onDeleteEntry}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="bg-[#006830]/95 backdrop-blur-md border border-white/20 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#ffb81c]" />
              {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Zone breakdown */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "General", value: selectedMember?.general ?? 0 },
                  { label: "Communication", value: selectedMember?.communication ?? 0 },
                  { label: "Program", value: selectedMember?.program ?? 0 },
                  { label: "Parliamentarian", value: selectedMember?.parliamentarian ?? 0 },
                ].map((zone) => (
                  <div
                    key={zone.label}
                    className="bg-white/10 rounded-xl p-3 text-center"
                  >
                    <p className="text-xs text-white/60 mb-1">{zone.label}</p>
                    <p className="text-lg font-bold text-white">{zone.value}</p>
                  </div>
                ))}
              </div>

              {/* Auto-derived points */}
              {autoPointTypes.length > 0 && memberDetail?.entries && (
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-2">
                    Auto-Derived Points
                  </p>
                  <div className="space-y-2">
                    {autoPointTypes.map(([key, pt]) => {
                      const earned = memberDetail.entries.filter(
                        (e: any) => e.pointTypeKey === key
                      );
                      if (earned.length === 0) return null;
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm"
                        >
                          <span className="text-white/80">{pt.label}</span>
                          <span className="text-white font-medium">
                            +{earned.reduce((s: number, e: any) => s + e.points, 0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Manual entries */}
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-2">
                  Manual Points
                </p>
                {memberManualEntries.length === 0 ? (
                  <p className="text-sm text-white/40 italic">No manual entries for this semester.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {memberManualEntries.map((entry) => {
                      const ptLabel = pointTypes[entry.pointTypeKey]?.label ?? entry.pointTypeKey;
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm"
                        >
                          <div>
                            <span className="text-white/80">{ptLabel}</span>
                            {entry.label && (
                              <span className="text-white/50 text-xs ml-2">— {entry.label}</span>
                            )}
                          </div>
                          <span className="text-white font-medium">+{entry.points}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-white/20 pt-4 flex items-center justify-between">
                <span className="text-white/80 font-semibold">Total Points</span>
                <span className="text-2xl font-bold text-[#ffb81c]">
                  {selectedMember?.totalPoints ?? 0}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ZONE_BADGE: Record<string, string> = {
  general: "bg-green-100 text-green-800",
  communication: "bg-blue-100 text-blue-800",
  program: "bg-purple-100 text-purple-800",
  parliamentarian: "bg-orange-100 text-orange-800",
};

function EntryHistoryTab({
  manualEntries,
  pointTypes,
  onDeleteEntry,
}: {
  manualEntries: PointEntry[];
  pointTypes: PointTypesMap;
  onDeleteEntry: (id: string) => Promise<void>;
}) {
  const [memberFilter, setMemberFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [entryToDelete, setEntryToDelete] = useState<PointEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ENTRIES_PER_PAGE = 10;

  const filteredEntries = manualEntries.filter((entry) => {
    const memberName =
      `${entry.member.firstName} ${entry.member.lastName}`.toLowerCase();
    const matchesMember =
      !memberFilter || memberName.includes(memberFilter.toLowerCase());
    const matchesZone =
      !zoneFilter || pointTypes[entry.pointTypeKey]?.zone === zoneFilter;
    const matchesType = !typeFilter || entry.pointTypeKey === typeFilter;
    return matchesMember && matchesZone && matchesType;
  });

  const totalPages = Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(
    startIndex,
    startIndex + ENTRIES_PER_PAGE
  );

  const hasFilters = !!(memberFilter || zoneFilter || typeFilter);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleZoneChange = (value: string) => {
    handleFilterChange(setZoneFilter, value);
    handleFilterChange(setTypeFilter, "");
  };

  const pointTypeOptions = Object.entries(pointTypes).filter(
    ([, pt]) => !zoneFilter || pt.zone === zoneFilter
  );

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    await onDeleteEntry(entryToDelete.id);
    setEntryToDelete(null);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Member search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search by member name..."
            value={memberFilter}
            onChange={(e) => handleFilterChange(setMemberFilter, e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-colors"
          />
        </div>

        {/* Zone filter */}
        <select
          value={zoneFilter}
          onChange={(e) => handleZoneChange(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
        >
          <option value="" className="bg-[#006830]">All Zones</option>
          <option value="general" className="bg-[#006830]">General</option>
          <option value="communication" className="bg-[#006830]">Communication</option>
          <option value="program" className="bg-[#006830]">Program</option>
          <option value="parliamentarian" className="bg-[#006830]">Parliamentarian</option>
        </select>

        {/* Point type filter */}
        <select
          value={typeFilter}
          onChange={(e) => handleFilterChange(setTypeFilter, e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
        >
          <option value="" className="bg-[#006830]">All Types</option>
          {pointTypeOptions.map(([key, pt]) => (
            <option key={key} value={key} className="bg-[#006830]">
              {pt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/20">
        <table className="w-full">
          <thead className="bg-white/10 border-b border-white/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                Member
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                Point Type
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/80 uppercase tracking-wider font-semibold hidden md:table-cell">
                Zone
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                Label
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                Points
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/80 uppercase tracking-wider font-semibold hidden md:table-cell">
                Awarded By
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs text-white/80 uppercase tracking-wider font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paginatedEntries.map((entry, index) => {
              const pt = pointTypes[entry.pointTypeKey];
              const zone = pt?.zone ?? "";
              const ptLabel = pt?.label ?? entry.pointTypeKey;
              return (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 + index * 0.02 }}
                  className="hover:bg-white/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-white font-medium">
                      {entry.member.firstName} {entry.member.lastName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white/90">{ptLabel}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {zone && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          ZONE_BADGE[zone] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {zone.charAt(0).toUpperCase() + zone.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white/70">
                      {entry.label ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-[#ffb81c]">
                      +{entry.points}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-white/70">
                      {entry.awardedBy.firstName} {entry.awardedBy.lastName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white/70">
                      {formatDate(entry.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEntryToDelete(entry)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-sm">
              {hasFilters
                ? "No entries match the current filters."
                : "No manual point entries for this semester yet."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEntries.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/80">
            Showing {startIndex + 1}–
            {Math.min(startIndex + ENTRIES_PER_PAGE, filteredEntries.length)} of{" "}
            {filteredEntries.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-white/30 hover:bg-white/40 text-white border-white/20"
                      : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                  }
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!entryToDelete}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
      >
        <DialogContent className="bg-[#006830]/95 backdrop-blur-md border border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              Remove Point Entry
            </DialogTitle>
          </DialogHeader>
          {entryToDelete && (
            <p className="text-white/80 text-sm">
              Remove{" "}
              <span className="font-semibold text-white">
                +{entryToDelete.points} points
              </span>{" "}
              ({pointTypes[entryToDelete.pointTypeKey]?.label ?? entryToDelete.pointTypeKey}) from{" "}
              <span className="font-semibold text-white">
                {entryToDelete.member.firstName} {entryToDelete.member.lastName}
              </span>
              ? This cannot be undone.
            </p>
          )}
          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setEntryToDelete(null)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeaderboardTab({
  leaderboard,
  onRowClick,
}: {
  leaderboard: LeaderboardEntry[];
  onRowClick: (entry: LeaderboardEntry) => void;
}) {
  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-12 h-12 text-white/30 mx-auto mb-3" />
        <p className="text-white/80">No point data for this semester yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/10 border-b border-white/20">
          <tr>
            <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
              #
            </th>
            <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
              Total Points
            </th>
            <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold hidden md:table-cell">
              General
            </th>
            <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold hidden md:table-cell">
              Communication
            </th>
            <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold hidden md:table-cell">
              Program
            </th>
            <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold hidden md:table-cell">
              Parliamentarian
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const rankStyle = RANK_STYLES[rank];
            return (
              <motion.tr
                key={entry.memberId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.03 }}
                onClick={() => onRowClick(entry)}
                className="hover:bg-white/10 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  {rankStyle ? (
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rankStyle.badge}`}
                    >
                      {rank}
                    </span>
                  ) : (
                    <span className="text-sm text-white/70">{rank}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm font-medium ${rankStyle ? rankStyle.text : "text-white"}`}
                  >
                    {entry.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-[#ffb81c]">
                    {entry.totalPoints}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-white/90">{entry.general}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-white/90">{entry.communication}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-white/90">{entry.program}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-white/90">{entry.parliamentarian}</span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Constants shared by BulkAwardTab ────────────────────────────────────────

type ConfirmedMember = { id: string; name: string; email: string };

const ZONE_ORDER = [
  "general",
  "communication",
  "program",
  "parliamentarian",
] as const;

const ZONE_LABELS: Record<string, string> = {
  general: "General",
  communication: "Communication",
  program: "Program",
  parliamentarian: "Parliamentarian",
};

// ─── Bulk Award Tab ───────────────────────────────────────────────────────────

function BulkAwardTab({
  pointTypes,
  semesters,
  selectedSemester,
  onBulkAward,
  onResolveMembers,
  token,
}: {
  pointTypes: PointTypesMap;
  semesters: string[];
  selectedSemester: string;
  onBulkAward: (payload: any) => Promise<void>;
  onResolveMembers: (lines: string[]) => Promise<ResolvedMembersResult | null>;
  token: string;
}) {
  // Step 1
  const [selectedPointTypeKey, setSelectedPointTypeKey] = useState("");
  const [label, setLabel] = useState("");

  // Step 2
  const [bulkSemester, setBulkSemester] = useState(selectedSemester);

  // Step 3 — shared confirmed list
  const [confirmedMembers, setConfirmedMembers] = useState<ConfirmedMember[]>([]);

  // Method A — Paste
  const [pasteText, setPasteText] = useState("");
  const [resolveResults, setResolveResults] =
    useState<ResolvedMembersResult | null>(null);
  const [resolving, setResolving] = useState(false);

  // Method B — Search
  const [memberMethod, setMemberMethod] = useState<"paste" | "search">("paste");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 4
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync semester when parent changes (only if form hasn't been touched)
  const initialSemesterRef = useRef(selectedSemester);
  useEffect(() => {
    if (selectedSemester !== initialSemesterRef.current) {
      setBulkSemester(selectedSemester);
      initialSemesterRef.current = selectedSemester;
    }
  }, [selectedSemester]);

  // Debounced member search (Method B)
  useEffect(() => {
    if (memberMethod !== "search") return;
    if (!memberSearchQuery.trim()) {
      setMemberSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await api.searchMembers(token, memberSearchQuery.trim());
        setMemberSearchResults(Array.isArray(results) ? results : []);
      } catch {
        setMemberSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [memberSearchQuery, memberMethod, token]);

  // ── Helpers
  const mergeMembers = useCallback((incoming: ConfirmedMember[]) => {
    setConfirmedMembers((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const novel = incoming.filter((m) => !existingIds.has(m.id));
      return [...prev, ...novel];
    });
  }, []);

  const removeMember = (id: string) =>
    setConfirmedMembers((prev) => prev.filter((m) => m.id !== id));

  const clearAll = () => {
    setConfirmedMembers([]);
    setResolveResults(null);
    setPasteText("");
    setMemberSearchQuery("");
    setMemberSearchResults([]);
  };

  // Method A: Resolve
  const handleResolve = async () => {
    const lines = pasteText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setResolving(true);
    try {
      const result = await onResolveMembers(lines);
      if (result) {
        setResolveResults(result);
        const resolved: ConfirmedMember[] = result.resolved.map((r) => ({
          id: r.member.id,
          name: r.member.name,
          email: r.member.email,
        }));
        mergeMembers(resolved);
      }
    } finally {
      setResolving(false);
    }
  };

  // Method B: toggle member selection
  const isSelectedInSearch = (id: string) =>
    confirmedMembers.some((m) => m.id === id);

  const toggleSearchMember = (member: any) => {
    const normalized: ConfirmedMember = {
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
    };
    if (isSelectedInSearch(member.id)) {
      removeMember(member.id);
    } else {
      mergeMembers([normalized]);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = memberSearchResults.every((m) =>
      isSelectedInSearch(m.id)
    );
    if (allSelected) {
      const ids = new Set(memberSearchResults.map((m) => m.id));
      setConfirmedMembers((prev) => prev.filter((m) => !ids.has(m.id)));
    } else {
      const incoming: ConfirmedMember[] = memberSearchResults.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        email: m.email,
      }));
      mergeMembers(incoming);
    }
  };

  // Submit
  const selectedPt = pointTypes[selectedPointTypeKey];
  const requiresLabel = selectedPt?.requiresLabel ?? false;
  const canSubmit =
    !!selectedPointTypeKey &&
    (!requiresLabel || label.trim() !== "") &&
    confirmedMembers.length > 0 &&
    !!bulkSemester &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onBulkAward({
        memberIds: confirmedMembers.map((m) => m.id),
        pointTypeKey: selectedPointTypeKey,
        semester: bulkSemester,
        label: label.trim() || undefined,
        note: note.trim() || undefined,
      });
      // Reset form on success
      setSelectedPointTypeKey("");
      setLabel("");
      setNote("");
      clearAll();
    } finally {
      setSubmitting(false);
    }
  };

  // Grouped point types by zone
  const groupedByZone = ZONE_ORDER.reduce<
    Record<string, Array<[string, PointTypesMap[string]]>>
  >((acc, zone) => {
    acc[zone] = Object.entries(pointTypes).filter(([, pt]) => pt.zone === zone);
    return acc;
  }, {} as Record<string, Array<[string, PointTypesMap[string]]>>);

  const inputClass =
    "w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-colors";

  const stepLabelClass =
    "text-xs font-semibold uppercase tracking-wider text-white/50 mb-1";

  return (
    <div className="p-6 space-y-5">
      {/* ── STEP 1: Point Type ───────────────────────────────────────── */}
      <StepCard number={1} title="Choose Point Type">
        <div>
          <p className={stepLabelClass}>Point Type</p>
          <select
            value={selectedPointTypeKey}
            onChange={(e) => {
              setSelectedPointTypeKey(e.target.value);
              setLabel("");
            }}
            className={inputClass}
          >
            <option value="" disabled className="bg-[#006830]">
              Select a point type…
            </option>
            {ZONE_ORDER.map((zone) => {
              const items = groupedByZone[zone];
              if (!items || items.length === 0) return null;
              return (
                <optgroup
                  key={zone}
                  label={ZONE_LABELS[zone]}
                  className="bg-[#006830]"
                >
                  {items.map(([key, pt]) => (
                    <option
                      key={key}
                      value={key}
                      className="bg-[#006830] text-white"
                    >
                      {pt.label} — {pt.points} pts
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {requiresLabel && (
          <div>
            <p className={stepLabelClass}>Label (required)</p>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter a name or label"
              className={inputClass}
            />
          </div>
        )}

        {selectedPt && (
          <div className="flex items-center gap-3 text-sm text-white/70 bg-white/5 rounded-lg px-3 py-2">
            <span className="text-[#ffb81c] font-bold">
              +{selectedPt.points} pts
            </span>
            <span className="text-white/30">·</span>
            <span>{ZONE_LABELS[selectedPt.zone] ?? selectedPt.zone} zone</span>
            {selectedPt.autoSource && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-white/50 italic">
                  auto: {selectedPt.autoSource}
                </span>
              </>
            )}
          </div>
        )}
      </StepCard>

      {/* ── STEP 2: Semester ─────────────────────────────────────────── */}
      <StepCard number={2} title="Choose Semester">
        <div>
          <p className={stepLabelClass}>Semester for this award</p>
          <select
            value={bulkSemester}
            onChange={(e) => setBulkSemester(e.target.value)}
            className={inputClass}
          >
            {semesters.map((s) => (
              <option key={s} value={s} className="bg-[#006830] text-white">
                {s}
              </option>
            ))}
          </select>
          <p className="text-xs text-white/40 mt-1.5">
            Changing this only affects the bulk award — it won&apos;t update the
            leaderboard view.
          </p>
        </div>
      </StepCard>

      {/* ── STEP 3: Select Members ───────────────────────────────────── */}
      <StepCard number={3} title="Select Members">
        {/* Confirmed members header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Users className="w-4 h-4 text-white/50" />
            <span>
              <span className="font-bold text-white">
                {confirmedMembers.length}
              </span>{" "}
              member{confirmedMembers.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          {confirmedMembers.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Chips */}
        {confirmedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {confirmedMembers.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1 bg-[#00a651]/40 border border-[#00a651]/60 text-white text-xs rounded-full px-3 py-1"
              >
                {m.name}
                <button
                  onClick={() => removeMember(m.id)}
                  className="text-white/60 hover:text-white transition-colors ml-1"
                  aria-label={`Remove ${m.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Method sub-tabs */}
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <div className="flex border-b border-white/10">
            {(["paste", "search"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setMemberMethod(method)}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  memberMethod === method
                    ? "bg-white/10 text-white border-b-2 border-[#ffb81c]"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {method === "paste"
                  ? "Method A: Paste List"
                  : "Method B: Search & Select"}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4">
            {/* ── METHOD A ── */}
            {memberMethod === "paste" && (
              <>
                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Paste one name or email per line, e.g.:\nJohn Smith\njane.doe@ucf.edu\nMarcus Williams`}
                  className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
                />

                <button
                  onClick={handleResolve}
                  disabled={resolving || !pasteText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {resolving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {resolving ? "Resolving…" : "Resolve Members"}
                </button>

                {resolveResults && (
                  <div className="space-y-2">
                    <p className="text-xs text-white/60">
                      <span className="text-green-400 font-semibold">
                        {resolveResults.resolved.length} resolved
                      </span>
                      {resolveResults.unresolved.length > 0 && (
                        <>
                          {" · "}
                          <span className="text-amber-400 font-semibold">
                            {resolveResults.unresolved.length} not found
                          </span>{" "}
                          (will be skipped)
                        </>
                      )}
                    </p>

                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {resolveResults.resolved.map((r) => (
                        <div
                          key={r.member.id}
                          className="flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          <span className="text-white/60 font-mono truncate max-w-[120px]">
                            &quot;{r.line}&quot;
                          </span>
                          <ChevronRight className="w-3 h-3 text-white/30 shrink-0" />
                          <span className="text-green-300 font-medium">
                            {r.member.name}
                          </span>
                          <span className="text-white/40 ml-auto shrink-0">
                            {r.member.email}
                          </span>
                        </div>
                      ))}
                      {resolveResults.unresolved.map((line) => (
                        <div
                          key={line}
                          className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-amber-300 font-mono truncate">
                            &quot;{line}&quot;
                          </span>
                          <span className="text-white/40 ml-auto text-xs italic shrink-0">
                            not found — skipped
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── METHOD B ── */}
            {memberMethod === "search" && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search by name or email…"
                    className={`${inputClass} pl-9`}
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
                  )}
                </div>

                {memberSearchResults.length > 0 && (
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    {/* Select all */}
                    <label className="flex items-center gap-3 px-4 py-2.5 bg-white/10 border-b border-white/10 cursor-pointer hover:bg-white/15 transition-colors">
                      <input
                        type="checkbox"
                        checked={memberSearchResults.every((m) =>
                          isSelectedInSearch(m.id)
                        )}
                        onChange={toggleSelectAll}
                        className="rounded border-white/30 bg-white/10 accent-[#00a651]"
                      />
                      <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                        Select all ({memberSearchResults.length})
                      </span>
                    </label>

                    {/* Results */}
                    <div className="max-h-[250px] overflow-y-auto divide-y divide-white/5">
                      {memberSearchResults.map((member) => {
                        const selected = isSelectedInSearch(member.id);
                        return (
                          <label
                            key={member.id}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                              selected ? "bg-[#00a651]/20" : "hover:bg-white/5"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSearchMember(member)}
                              className="rounded border-white/30 bg-white/10 accent-[#00a651]"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-white/50 truncate">
                                {member.email}
                              </p>
                            </div>
                            {selected && (
                              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {memberSearchQuery && !searching && memberSearchResults.length === 0 && (
                  <p className="text-sm text-white/40 text-center py-4">
                    No members found for &quot;{memberSearchQuery}&quot;
                  </p>
                )}

                {!memberSearchQuery && (
                  <p className="text-sm text-white/30 text-center py-4 italic">
                    Start typing to search for members…
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </StepCard>

      {/* ── STEP 4: Review & Submit ──────────────────────────────────── */}
      <StepCard number={4} title="Review & Submit">
        {/* Summary */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-sm">
          <SummaryRow
            label="Point Type"
            value={
              selectedPt?.label ?? (
                <span className="text-white/30 italic">not selected</span>
              )
            }
          />
          {requiresLabel && (
            <SummaryRow
              label="Label"
              value={
                label || (
                  <span className="text-amber-400 italic">
                    required — not entered
                  </span>
                )
              }
            />
          )}
          <SummaryRow
            label="Points per Member"
            value={
              selectedPt ? (
                <span className="text-[#ffb81c] font-bold">
                  +{selectedPt.points}
                </span>
              ) : (
                <span className="text-white/30 italic">—</span>
              )
            }
          />
          <SummaryRow
            label="Members"
            value={
              confirmedMembers.length > 0 ? (
                <span className="text-white font-semibold">
                  {confirmedMembers.length} member
                  {confirmedMembers.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-white/30 italic">none selected</span>
              )
            }
          />
          <SummaryRow
            label="Semester"
            value={
              bulkSemester || (
                <span className="text-white/30 italic">not selected</span>
              )
            }
          />
        </div>

        {/* Optional note */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
            Note (optional)
          </p>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an optional note about this award…"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
            canSubmit
              ? "bg-[#ffb81c] hover:bg-[#e6a619] text-[#003d1f] shadow-lg shadow-[#ffb81c]/20"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting
            ? "Awarding points…"
            : `Award Points to ${confirmedMembers.length} Member${
                confirmedMembers.length !== 1 ? "s" : ""
              }`}
        </button>

        {!canSubmit && !submitting && (
          <p className="text-xs text-white/30 text-center -mt-1">
            {!selectedPointTypeKey
              ? "Select a point type to continue"
              : requiresLabel && !label.trim()
              ? "Enter a label for this point type"
              : confirmedMembers.length === 0
              ? "Select at least one member"
              : ""}
          </p>
        )}
      </StepCard>
    </div>
  );
}

// ─── Small presentational helpers ────────────────────────────────────────────

function StepCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border-b border-white/10">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#ffb81c]/20 text-[#ffb81c] text-xs font-bold border border-[#ffb81c]/30">
          {number}
        </span>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-white/50 shrink-0">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  );
}

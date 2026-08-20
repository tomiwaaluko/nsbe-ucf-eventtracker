"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

function downloadBlob(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportFilename(ext: "json" | "csv") {
  const date = new Date().toISOString().slice(0, 10);
  return `nsbe-my-data-export-${date}.${ext}`;
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str =
    value instanceof Date ? value.toISOString() : String(value);
  const needsFormulaGuard = /^[=+\-@\t\r]/.test(str);
  const guarded = needsFormulaGuard ? `'${str}` : str;
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}

type ExportPayload = Awaited<ReturnType<typeof api.exportMyData>>;

function buildCsvFromExport(data: ExportPayload): string {
  const lines: string[] = [];
  const row = (cells: unknown[]) =>
    lines.push(cells.map(escapeCsvCell).join(","));

  lines.push("Section,Profile");
  row(["Field", "Value"]);
  for (const [key, value] of Object.entries(data.profile)) {
    row([key, value]);
  }

  lines.push("");
  lines.push("Section,OAuth Accounts");
  row(["Provider", "Provider Email", "Email Verified", "Created At"]);
  for (const account of data.oauthAccounts) {
    row([
      account.provider,
      account.providerEmail,
      account.emailVerified,
      account.createdAt,
    ]);
  }

  lines.push("");
  lines.push("Section,Attendance");
  row([
    "Event Name",
    "Category",
    "Semester",
    "Start Time",
    "Location",
    "Checked In At",
    "Check-In Method",
  ]);
  for (const record of data.attendance) {
    row([
      record.event.name,
      record.event.category,
      record.event.semester,
      record.event.startTime,
      record.event.location,
      record.checkedInAt,
      record.checkInMethod,
    ]);
  }

  lines.push("");
  lines.push("Section,Event Interests");
  row(["Event Name", "Status", "Semester", "Start Time", "Created At"]);
  for (const interest of data.eventInterests) {
    row([
      interest.event.name,
      interest.status,
      interest.event.semester,
      interest.event.startTime,
      interest.createdAt,
    ]);
  }

  lines.push("");
  lines.push("Section,Achievements (All Time)");
  row([
    "Achievement",
    "Completed",
    "Completed At",
    "Bucket 1",
    "Bucket 2",
    "Bucket 3",
  ]);
  row([
    "111",
    data.achievements.oneOneOne.completed,
    data.achievements.oneOneOne.completedAt ?? "",
    data.achievements.oneOneOne.progress.bucket1,
    data.achievements.oneOneOne.progress.bucket2,
    data.achievements.oneOneOne.progress.bucket3,
  ]);
  row([
    "333",
    data.achievements.threeThreeThree.completed,
    data.achievements.threeThreeThree.completedAt ?? "",
    data.achievements.threeThreeThree.progress.bucket1,
    data.achievements.threeThreeThree.progress.bucket2,
    data.achievements.threeThreeThree.progress.bucket3,
  ]);

  lines.push("");
  lines.push("Section,Achievements By Semester");
  row([
    "Semester",
    "Workshops/Socials",
    "Fundraiser/Community Service",
    "GBM",
    "111 Complete",
    "333 Complete",
  ]);
  for (const sem of data.achievementsBySemester) {
    row([
      sem.semester,
      sem.workshopsSocials,
      sem.fundraiserCommunityService,
      sem.gbm,
      sem.has111,
      sem.has333,
    ]);
  }

  lines.push("");
  lines.push("Section,Manual Points");
  row([
    "Semester",
    "Point Type",
    "Points",
    "Label",
    "Note",
    "Awarded By",
    "Awarded At",
  ]);
  for (const semesterBlock of data.points.bySemester) {
    for (const entry of semesterBlock.manualEntries) {
      row([
        semesterBlock.semester,
        entry.pointTypeKey,
        entry.points,
        entry.label,
        entry.note,
        entry.awardedByName ?? "",
        entry.createdAt,
      ]);
    }
  }

  lines.push("");
  lines.push("Section,Auto Points");
  row([
    "Semester",
    "Point Type",
    "Points",
    "Label",
    "Zone",
    "Event Name",
    "Event Start",
  ]);
  for (const semesterBlock of data.points.bySemester) {
    for (const entry of semesterBlock.autoEntries) {
      row([
        semesterBlock.semester,
        entry.pointTypeKey,
        entry.points,
        entry.label,
        entry.zone,
        entry.eventName,
        entry.eventStartTime,
      ]);
    }
  }

  lines.push("");
  lines.push("Section,Points Summary By Semester");
  row([
    "Semester",
    "Total Points",
    "General",
    "Communication",
    "Program",
    "Parliamentarian",
  ]);
  for (const semesterBlock of data.points.bySemester) {
    row([
      semesterBlock.semester,
      semesterBlock.totalPoints,
      semesterBlock.zones.general,
      semesterBlock.zones.communication,
      semesterBlock.zones.program,
      semesterBlock.zones.parliamentarian,
    ]);
  }

  return lines.join("\n");
}

export function DataExportSection() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not signed in", {
        description: "Please sign in and try again.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const jsonData = await api.exportMyData(token, "json");
      downloadBlob(
        JSON.stringify(jsonData, null, 2),
        exportFilename("json"),
        "application/json",
      );

      const csvData = buildCsvFromExport(jsonData);
      downloadBlob(csvData, exportFilename("csv"), "text/csv");

      toast.success("Download started", {
        description: "Your JSON and CSV exports are downloading.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Please try again.";
      toast.error("Export failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-white/10 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-white/60" />
            Download my data
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Export your profile, attendance, event interests, points, and
            111/333 progress as JSON and CSV files.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download my data
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

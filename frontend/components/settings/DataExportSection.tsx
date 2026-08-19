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

      const csvData = await api.exportMyData(token, "csv");
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

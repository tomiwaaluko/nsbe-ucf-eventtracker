"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function DuesStatusSection() {
  const [chapterDuesPaid, setChapterDuesPaid] = useState(false);
  const [nationalDuesPaid, setNationalDuesPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadDuesStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await api.getMe(token);
        setChapterDuesPaid(!!data.chapterDuesSelfReported);
        setNationalDuesPaid(!!data.nationalDuesSelfReported);
      } catch (error) {
        console.error("Failed to load dues status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDuesStatus();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.updateMyDuesStatus(token, {
        chapterDuesSelfReported: chapterDuesPaid,
        nationalDuesSelfReported: nationalDuesPaid,
      });

      setHasChanges(false);
      toast.success("Dues status updated", {
        description: "Your self-reported dues status has been saved.",
      });
    } catch (error) {
      console.error("Failed to save dues status:", error);
      toast.error("Save failed", {
        description: "Could not update your dues status. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="border-t border-white/10 pt-6">
        <p className="text-white/60 text-sm">Loading dues status...</p>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 pt-6">
      <h3 className="font-extrabold text-white text-xl mb-2">
        Membership Dues (Self-Reported)
      </h3>
      <p className="text-sm text-white/60 mb-4">
        Honor-system checkboxes only. Update these if you pay chapter or national
        NSBE dues after sign-up. This is separate from your account active status
        and chapter membership tracking.
      </p>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="settings-chapter-dues"
            checked={chapterDuesPaid}
            onCheckedChange={(checked) => {
              setChapterDuesPaid(checked === true);
              setHasChanges(true);
            }}
            className="mt-1 border-white/30 data-[state=checked]:bg-[#00a651]"
          />
          <Label
            htmlFor="settings-chapter-dues"
            className="font-medium text-white cursor-pointer"
          >
            I have paid NSBE UCF chapter dues for this academic year
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="settings-national-dues"
            checked={nationalDuesPaid}
            onCheckedChange={(checked) => {
              setNationalDuesPaid(checked === true);
              setHasChanges(true);
            }}
            className="mt-1 border-white/30 data-[state=checked]:bg-[#00a651]"
          />
          <Label
            htmlFor="settings-national-dues"
            className="font-medium text-white cursor-pointer"
          >
            I have paid national NSBE membership dues for this academic year
          </Label>
        </div>
      </div>

      {hasChanges && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#00843D] hover:bg-[#006830] text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save Dues Status
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

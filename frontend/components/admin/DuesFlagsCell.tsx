"use client";

import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface DuesFlagsCellProps {
  memberId: string;
  chapterDuesSelfReported: boolean;
  nationalDuesSelfReported: boolean;
  onUpdateDues: (
    memberId: string,
    data: {
      chapterDuesSelfReported?: boolean;
      nationalDuesSelfReported?: boolean;
    }
  ) => void;
}

export function DuesFlagsCell({
  memberId,
  chapterDuesSelfReported,
  nationalDuesSelfReported,
  onUpdateDues,
}: DuesFlagsCellProps) {
  return (
    <div className="space-y-2 min-w-[180px]">
      <p className="text-[10px] uppercase tracking-wide text-white/50 font-semibold">
        Self-Reported Dues
      </p>
      <div className="flex items-start gap-2">
        <Checkbox
          id={`chapter-dues-${memberId}`}
          checked={chapterDuesSelfReported}
          onCheckedChange={(checked) =>
            onUpdateDues(memberId, {
              chapterDuesSelfReported: checked === true,
            })
          }
          className="mt-0.5 border-white/30 data-[state=checked]:bg-[#00a651]"
        />
        <Label
          htmlFor={`chapter-dues-${memberId}`}
          className="text-xs text-white/90 cursor-pointer leading-tight"
        >
          Chapter dues paid
        </Label>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id={`national-dues-${memberId}`}
          checked={nationalDuesSelfReported}
          onCheckedChange={(checked) =>
            onUpdateDues(memberId, {
              nationalDuesSelfReported: checked === true,
            })
          }
          className="mt-0.5 border-white/30 data-[state=checked]:bg-[#00a651]"
        />
        <Label
          htmlFor={`national-dues-${memberId}`}
          className="text-xs text-white/90 cursor-pointer leading-tight"
        >
          National dues paid
        </Label>
      </div>
    </div>
  );
}

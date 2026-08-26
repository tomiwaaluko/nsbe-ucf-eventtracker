"use client";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CreditCard, UserCheck, UserX } from "lucide-react";

interface MembershipToggleProps {
  memberId: string;
  memberName: string;
  chapterMembershipActive: boolean;
  onToggleMembership: (memberId: string, chapterMembershipActive: boolean) => void;
}

export function MembershipToggle({
  memberId,
  memberName,
  chapterMembershipActive,
  onToggleMembership,
}: MembershipToggleProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-white/20 bg-white/5 p-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <CreditCard className="h-4 w-4" />
          Chapter membership
        </div>
        <p className="text-xs text-white/60">
          Paid/unpaid dues for {memberName}. This does not disable login.
        </p>
        <Badge
          className={
            chapterMembershipActive
              ? "bg-green-500/30 text-white border-green-500/50"
              : "bg-white/20 text-white/70"
          }
        >
          {chapterMembershipActive ? "Paid" : "Unpaid"}
        </Badge>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        onClick={() => onToggleMembership(memberId, !chapterMembershipActive)}
      >
        {chapterMembershipActive ? (
          <>
            <UserX className="mr-2 h-4 w-4" />
            Mark Unpaid
          </>
        ) : (
          <>
            <UserCheck className="mr-2 h-4 w-4" />
            Mark Paid
          </>
        )}
      </Button>
    </div>
  );
}

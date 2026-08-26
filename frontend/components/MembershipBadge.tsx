import { Badge } from "./ui/badge";

interface MembershipBadgeProps {
  chapterMembershipActive: boolean;
  className?: string;
}

export function MembershipBadge({
  chapterMembershipActive,
  className,
}: MembershipBadgeProps) {
  return (
    <Badge
      className={
        chapterMembershipActive
          ? `bg-[#00a651] text-white border-2 border-black ${className ?? ""}`
          : `bg-white/20 text-white/90 border-2 border-white/30 ${className ?? ""}`
      }
    >
      {chapterMembershipActive ? "Chapter Dues: Paid" : "Chapter Dues: Unpaid"}
    </Badge>
  );
}

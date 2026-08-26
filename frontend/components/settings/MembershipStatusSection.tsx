import { MembershipBadge } from "../MembershipBadge";

interface MembershipStatusSectionProps {
  chapterMembershipActive: boolean;
}

export function MembershipStatusSection({
  chapterMembershipActive,
}: MembershipStatusSectionProps) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-white">Chapter Membership</h3>
        <p className="text-sm text-white/60 mt-1">
          Your NSBE UCF chapter dues status for the current membership year
          (August 1 through July 31, Eastern Time).
        </p>
      </div>
      <MembershipBadge chapterMembershipActive={chapterMembershipActive} />
      <p className="text-xs text-white/50">
        Only officers can update membership status. Contact an admin if you
        believe this is incorrect.
      </p>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Edit,
  Eye,
  MoreVertical,
  Award,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Mail,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { MembershipToggle } from "./admin/MembershipToggle";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "OFFICER" | "ADMIN";
  isActive: boolean;
  chapterMembershipActive?: boolean;
  workshopsAttended: number;
  gbmAttended: number;
  communityServiceAttended: number;
  totalEvents: number;
  joinedDate: string;
}

interface MemberManagementProps {
  members: Member[];
  onEditMember: (memberId: string, data: Partial<Member>) => void;
  onViewMember: (memberId: string) => void;
  onToggleStatus: (memberId: string, isActive: boolean) => void;
  onToggleMembership?: (memberId: string, chapterMembershipActive: boolean) => void;
}

export function MemberManagement({
  members,
  onEditMember,
  onViewMember,
  onToggleStatus,
  onToggleMembership,
}: MemberManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProgress, setFilterProgress] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState({
    workshopsAttended: 0,
    gbmAttended: 0,
    communityServiceAttended: 0,
  });
  const itemsPerPage = 10;

  // Filter members
  const filteredMembers = Array.isArray(members)
    ? members.filter((member) => {
        const matchesSearch =
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === "all" || member.role === filterRole;

        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "active" && member.isActive) ||
          (filterStatus === "inactive" && !member.isActive);

        let matchesProgress = true;
        if (filterProgress === "111") {
          matchesProgress =
            member.workshopsAttended >= 1 &&
            member.gbmAttended >= 1 &&
            member.communityServiceAttended >= 1;
        } else if (filterProgress === "333") {
          matchesProgress =
            member.workshopsAttended >= 3 &&
            member.gbmAttended >= 3 &&
            member.communityServiceAttended >= 3;
        } else if (filterProgress === "none") {
          matchesProgress =
            member.workshopsAttended < 1 ||
            member.gbmAttended < 1 ||
            member.communityServiceAttended < 1;
        }

        return matchesSearch && matchesRole && matchesStatus && matchesProgress;
      })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "OFFICER":
        return "bg-blue-100 text-blue-700";
      case "MEMBER":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getProgressStatus = (member: Member) => {
    const has333 =
      member.workshopsAttended >= 3 &&
      member.gbmAttended >= 3 &&
      member.communityServiceAttended >= 3;
    const has111 =
      member.workshopsAttended >= 1 &&
      member.gbmAttended >= 1 &&
      member.communityServiceAttended >= 1;

    if (has333) return { label: "3-3-3", color: "#ffb81c" };
    if (has111) return { label: "1-1-1", color: "#00a651" };
    return { label: "In Progress", color: "#6b7280" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    setEditFormData({
      workshopsAttended: member.workshopsAttended,
      gbmAttended: member.gbmAttended,
      communityServiceAttended: member.communityServiceAttended,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (selectedMember) {
      onEditMember(selectedMember.id, {
        workshopsAttended: editFormData.workshopsAttended,
        gbmAttended: editFormData.gbmAttended,
        communityServiceAttended: editFormData.communityServiceAttended,
        totalEvents:
          editFormData.workshopsAttended +
          editFormData.gbmAttended +
          editFormData.communityServiceAttended,
      });
      setEditDialogOpen(false);
      setSelectedMember(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-3xl font-bold text-white">Member Management</h2>
          <p className="text-white/80 mt-1">
            View, search, and manage member progress
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                />
              </div>
            </div>

            {/* Role Filter */}
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="OFFICER">Officer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Progress Filter */}
            <Select value={filterProgress} onValueChange={setFilterProgress}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Progress</SelectItem>
                <SelectItem value="333">3-3-3 Complete</SelectItem>
                <SelectItem value="111">1-1-1 Complete</SelectItem>
                <SelectItem value="none">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <p className="text-sm text-white/80">
              Showing {filteredMembers.length} of {members.length} members
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/80">
                Active:{" "}
                <strong className="text-white">
                  {Array.isArray(members)
                    ? members.filter((m) => m.isActive).length
                    : 0}
                </strong>
              </span>
              <span className="text-white/80">
                3-3-3:{" "}
                <strong className="text-white">
                  {Array.isArray(members)
                    ? members.filter(
                        (m) =>
                          m.workshopsAttended >= 3 &&
                          m.gbmAttended >= 3 &&
                          m.communityServiceAttended >= 3
                      ).length
                    : 0}
                </strong>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Members Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Membership
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Workshops
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    GBMs
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Community
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs text-white/80 uppercase tracking-wider font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedMembers.map((member, index) => {
                  const progress = getProgressStatus(member);
                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="hover:bg-white/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/members/${member.id}`}
                            className="text-sm font-medium text-white hover:text-[#ffb81c] transition-colors hover:underline"
                          >
                            {member.name}
                          </Link>
                          <p className="text-xs text-white/60">
                            {member.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={member.isActive ? "default" : "secondary"}
                          className={
                            member.isActive
                              ? "bg-green-500/30 text-white border-green-500/50"
                              : "bg-white/20 text-white/70"
                          }
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {onToggleMembership ? (
                          <MembershipToggle
                            memberId={member.id}
                            memberName={member.name}
                            chapterMembershipActive={member.chapterMembershipActive ?? false}
                            onToggleMembership={onToggleMembership}
                          />
                        ) : (
                          <Badge
                            className={
                              member.chapterMembershipActive
                                ? "bg-green-500/30 text-white border-green-500/50"
                                : "bg-white/20 text-white/70"
                            }
                          >
                            {member.chapterMembershipActive ? "Paid" : "Unpaid"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          style={{
                            backgroundColor: `${progress.color}40`,
                            color: "white",
                          }}
                          className="font-medium"
                        >
                          {progress.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/90">
                          {member.workshopsAttended} / 3
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/90">
                          {member.gbmAttended} / 3
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/90">
                          {member.communityServiceAttended} / 3
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/90">
                          {formatDate(member.joinedDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onViewMember(member.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(member)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onToggleStatus(member.id, !member.isActive)
                              }
                            >
                              {member.isActive ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-white/10">
            {paginatedMembers.map((member, index) => {
              const progress = getProgressStatus(member);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link
                        href={`/members/${member.id}`}
                        className="text-white font-medium mb-1 hover:text-[#ffb81c] transition-colors hover:underline block"
                      >
                        {member.name}
                      </Link>
                      <p className="text-xs text-white/60 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewMember(member.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditClick(member)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            onToggleStatus(member.id, !member.isActive)
                          }
                        >
                          {member.isActive ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                    <Badge
                      variant={member.isActive ? "default" : "secondary"}
                      className={
                        member.isActive
                          ? "bg-green-500/30 text-white border-green-500/50"
                          : "bg-white/20 text-white/70"
                      }
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      style={{
                        backgroundColor: `${progress.color}40`,
                        color: "white",
                      }}
                    >
                      {progress.label}
                    </Badge>
                  </div>

                  {onToggleMembership && (
                    <MembershipToggle
                      memberId={member.id}
                      memberName={member.name}
                      chapterMembershipActive={member.chapterMembershipActive ?? false}
                      onToggleMembership={onToggleMembership}
                    />
                  )}

                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="text-white/60 text-xs">Workshops</p>
                      <p className="text-white font-medium">
                        {member.workshopsAttended}/3
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">GBMs</p>
                      <p className="text-white font-medium">
                        {member.gbmAttended}/3
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Community</p>
                      <p className="text-white font-medium">
                        {member.communityServiceAttended}/3
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/80">No members found</p>
              <p className="text-sm text-white/60 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between"
          >
            <p className="text-sm text-white/80">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredMembers.length)} of{" "}
              {filteredMembers.length} members
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((page) => (
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
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Edit Progress Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-md border-white/20">
            <DialogHeader>
              <DialogTitle>Edit Member Progress</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-900 font-medium">
                    {selectedMember.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedMember.email}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workshops">Workshops Attended</Label>
                    <Input
                      id="workshops"
                      type="number"
                      min="0"
                      value={editFormData.workshopsAttended}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          workshopsAttended: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gbm">GBMs Attended</Label>
                    <Input
                      id="gbm"
                      type="number"
                      min="0"
                      value={editFormData.gbmAttended}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          gbmAttended: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="community">
                      Community Service Attended
                    </Label>
                    <Input
                      id="community"
                      type="number"
                      min="0"
                      value={editFormData.communityServiceAttended}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          communityServiceAttended:
                            parseInt(e.target.value) || 0,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                className="bg-[#00a651] hover:bg-[#008a44] text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

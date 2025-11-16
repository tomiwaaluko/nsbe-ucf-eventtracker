import { useState } from "react";
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

interface Member {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "OFFICER" | "ADMIN";
  isActive: boolean;
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
}

export function MemberManagement({
  members,
  onEditMember,
  onViewMember,
  onToggleStatus,
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
  const filteredMembers = members.filter((member) => {
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
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Member Management</h2>
        <p className="text-gray-600 mt-1">
          View, search, and manage member progress
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger>
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
            <SelectTrigger>
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
            <SelectTrigger>
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
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Active: <strong>{members.filter((m) => m.isActive).length}</strong>
            </span>
            <span className="text-gray-600">
              3-3-3:{" "}
              <strong>
                {
                  members.filter(
                    (m) =>
                      m.workshopsAttended >= 3 &&
                      m.gbmAttended >= 3 &&
                      m.communityServiceAttended >= 3
                  ).length
                }
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Workshops
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  GBMs
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Community
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedMembers.map((member) => {
                const progress = getProgressStatus(member);
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
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
                          member.isActive ? "bg-green-100 text-green-700" : ""
                        }
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        style={{
                          backgroundColor: `${progress.color}20`,
                          color: progress.color,
                        }}
                      >
                        {progress.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {member.workshopsAttended} / 3
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {member.gbmAttended} / 3
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {member.communityServiceAttended} / 3
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(member.joinedDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewMember(member.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(member)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(member.id, !member.isActive)}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {paginatedMembers.map((member) => {
            const progress = getProgressStatus(member);
            return (
              <div key={member.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewMember(member.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(member)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(member.id, !member.isActive)}
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
                    className={member.isActive ? "bg-green-100 text-green-700" : ""}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: `${progress.color}20`,
                      color: progress.color,
                    }}
                  >
                    {progress.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Workshops</p>
                    <p className="text-gray-900">{member.workshopsAttended}/3</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">GBMs</p>
                    <p className="text-gray-900">{member.gbmAttended}/3</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Community</p>
                    <p className="text-gray-900">
                      {member.communityServiceAttended}/3
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No members found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)}{" "}
            of {filteredMembers.length} members
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? "bg-[#00a651] hover:bg-[#008a44] text-white"
                        : ""
                    }
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Progress Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Progress</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-900">{selectedMember.name}</p>
                <p className="text-xs text-gray-500">{selectedMember.email}</p>
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
                  <Label htmlFor="community">Community Service Attended</Label>
                  <Input
                    id="community"
                    type="number"
                    min="0"
                    value={editFormData.communityServiceAttended}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        communityServiceAttended: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
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
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { DashboardLayout } from "./DashboardLayout";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Users,
  Inbox,
  Send,
  UserMinus,
  X,
  Check,
} from "lucide-react";
import { Bricolage_Grotesque, Sora } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  major?: string;
  graduationYear?: number;
  friendshipStatus: string;
}

interface Friend {
  friendshipId: string;
  friend: Member;
  friendsSince: string;
}

interface FriendRequest {
  requestId: string;
  requester?: Member;
  recipient?: Member;
  sentAt: string;
}

export function FriendsPage() {
  const [activeTab, setActiveTab] = useState("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [directory, setDirectory] = useState<Member[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<FriendRequest[]>([]);
  const [requestsSent, setRequestsSent] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  // Load counts on mount for tab labels
  useEffect(() => {
    if (token) {
      loadCounts();
    }
  }, []);

  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadCounts = async () => {
    if (!token) return;
    try {
      // Load friends count and requests count for tab labels
      const [friendsData, requestsData] = await Promise.all([
        api.getFriends(token),
        api.getFriendRequestsReceived(token),
      ]);
      setFriends(friendsData);
      setRequestsReceived(requestsData);
    } catch (error) {
      console.error("Failed to load counts:", error);
    }
  };

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      if (activeTab === "directory") {
        const data = await api.getMemberDirectory(token, searchQuery);
        setDirectory(data);
      } else if (activeTab === "friends") {
        const data = await api.getFriends(token);
        setFriends(data);
      } else if (activeTab === "requests") {
        const [received, sent] = await Promise.all([
          api.getFriendRequestsReceived(token),
          api.getFriendRequestsSent(token),
        ]);
        setRequestsReceived(received);
        setRequestsSent(sent);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getMemberDirectory(token, searchQuery);
      setDirectory(data);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    if (!token) return;
    try {
      await api.sendFriendRequest(token, userId);
      toast.success("Friend request sent!");
      loadData();
      loadCounts(); // Update tab counts
    } catch (error: any) {
      toast.error(error.message || "Failed to send request");
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!token) return;
    try {
      await api.acceptFriendRequest(token, userId);
      toast.success("Friend request accepted!");
      loadData();
      loadCounts(); // Update tab counts
    } catch (error: any) {
      toast.error(error.message || "Failed to accept request");
    }
  };

  const handleDeclineRequest = async (userId: string) => {
    if (!token) return;
    try {
      await api.declineFriendRequest(token, userId);
      toast.success("Friend request declined");
      loadData();
      loadCounts(); // Update tab counts
    } catch (error: any) {
      toast.error(error.message || "Failed to decline request");
    }
  };

  const handleCancelRequest = async (userId: string) => {
    if (!token) return;
    try {
      await api.cancelFriendRequest(token, userId);
      toast.success("Friend request cancelled");
      loadData();
      loadCounts(); // Update tab counts
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel request");
    }
  };

  const handleUnfriend = async (userId: string, name: string) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to unfriend ${name}?`)) return;

    try {
      await api.unfriend(token, userId);
      toast.success("Unfriended successfully");
      loadData();
      loadCounts(); // Update tab counts
    } catch (error: any) {
      toast.error(error.message || "Failed to unfriend");
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const renderDirectory = () => (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Search members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className={`border-4 border-black h-14 text-lg ${sora.className} focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-[#00a651]`}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          className={`h-14 px-8 bg-[#00a651] hover:bg-[#008a43] text-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all ${bricolage.className} font-bold text-lg`}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {directory.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotate: 0.5 }}
            className="relative h-full"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] h-full flex flex-col">
              <div className="flex items-start gap-4 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                  <div className="relative w-16 h-16 bg-[#00a651] border-3 border-black flex items-center justify-center overflow-hidden">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className={`text-white font-bold text-xl ${bricolage.className}`}
                      >
                        {getInitials(member.firstName, member.lastName)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-extrabold text-lg text-black truncate ${bricolage.className}`}
                  >
                    {member.firstName} {member.lastName}
                  </p>
                  {member.major && (
                    <p
                      className={`text-sm text-black font-medium truncate ${sora.className}`}
                    >
                      {member.major}
                    </p>
                  )}
                  {member.graduationYear && (
                    <p
                      className={`text-xs text-black/70 font-medium ${sora.className}`}
                    >
                      Class of {member.graduationYear}
                    </p>
                  )}
                  <div className="mt-3">
                    {member.friendshipStatus === "SELF" && (
                      <div className="inline-block px-3 py-1.5 bg-black/10 border-2 border-black">
                        <span
                          className={`text-xs font-bold uppercase ${bricolage.className}`}
                        >
                          You
                        </span>
                      </div>
                    )}
                    {member.friendshipStatus === "FRIENDS" && (
                      <div className="flex gap-2">
                        <div className="inline-block px-3 py-1.5 bg-[#00a651] border-2 border-black">
                          <span
                            className={`text-xs font-bold uppercase text-white ${bricolage.className}`}
                          >
                            Friends
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUnfriend(
                              member.id,
                              `${member.firstName} ${member.lastName}`
                            )
                          }
                          className={`bg-[#ed1c24] hover:bg-[#c41820] text-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold text-xs h-8`}
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          Unfriend
                        </Button>
                      </div>
                    )}
                    {member.friendshipStatus === "NONE" && (
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(member.id)}
                        className={`bg-[#00a651] hover:bg-[#008a43] text-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold text-xs h-8`}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add Friend
                      </Button>
                    )}
                    {member.friendshipStatus === "REQUEST_SENT" && (
                      <div className="flex gap-2">
                        <div className="inline-block px-3 py-1.5 bg-[#ffb81c] border-2 border-black">
                          <span
                            className={`text-xs font-bold uppercase ${bricolage.className}`}
                          >
                            Pending
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCancelRequest(member.id)}
                          className={`bg-white hover:bg-black/5 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold text-xs h-8`}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {member.friendshipStatus === "REQUEST_RECEIVED" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(member.id)}
                          className={`bg-[#00a651] hover:bg-[#008a43] text-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold text-xs h-8`}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeclineRequest(member.id)}
                          className={`bg-white hover:bg-black/5 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold text-xs h-8`}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {directory.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-black/30 mx-auto mb-4" />
          <p className={`${sora.className} text-black/70 font-medium`}>
            No members found
          </p>
        </div>
      )}
    </div>
  );

  const renderFriends = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map(({ friend, friendsSince }) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotate: 0.5 }}
            className="relative h-full"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] h-full flex flex-col">
              <div className="flex items-start gap-4 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                  <div className="relative w-16 h-16 bg-[#00a651] border-3 border-black flex items-center justify-center overflow-hidden">
                    {friend.photoUrl ? (
                      <img
                        src={friend.photoUrl}
                        alt={`${friend.firstName} ${friend.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className={`text-white font-bold text-xl ${bricolage.className}`}
                      >
                        {getInitials(friend.firstName, friend.lastName)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-extrabold text-lg text-black truncate ${bricolage.className}`}
                  >
                    {friend.firstName} {friend.lastName}
                  </p>
                  {friend.major && (
                    <p
                      className={`text-sm text-black font-medium truncate ${sora.className}`}
                    >
                      {friend.major}
                    </p>
                  )}
                  <p className={`text-xs text-black/70 font-medium mt-1 ${sora.className}`}>
                    Friends since {new Date(friendsSince).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUnfriend(
                          friend.id,
                          `${friend.firstName} ${friend.lastName}`
                        )
                      }
                      className={`bg-white hover:bg-black/5 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold text-xs h-8`}
                    >
                      <UserMinus className="h-3 w-3 mr-1" />
                      Unfriend
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {friends.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-black/30 mx-auto mb-4" />
          <p className={`${sora.className} text-black/70 font-medium mb-2`}>
            No friends yet
          </p>
          <p className={`${sora.className} text-black/60 text-sm`}>
            Start by sending friend requests in the Directory tab!
          </p>
        </div>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      {/* Requests Received */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
        <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
          <h3
            className={`flex items-center gap-2 text-xl font-extrabold text-black mb-4 uppercase ${bricolage.className}`}
          >
            <Inbox className="h-6 w-6" />
            Requests Received ({requestsReceived.length})
          </h3>
          <div className="space-y-3">
            {requestsReceived.map(({ requester, sentAt }) =>
              requester ? (
                <div
                  key={requester.id}
                  className="flex items-center justify-between p-4 border-2 border-black bg-black/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                      <div className="relative w-12 h-12 bg-[#00a651] border-2 border-black flex items-center justify-center overflow-hidden">
                        {requester.photoUrl ? (
                          <img
                            src={requester.photoUrl}
                            alt={`${requester.firstName} ${requester.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className={`text-white font-bold ${bricolage.className}`}
                          >
                            {getInitials(
                              requester.firstName,
                              requester.lastName
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`font-extrabold text-black ${bricolage.className}`}>
                        {requester.firstName} {requester.lastName}
                      </p>
                      <p className={`text-sm text-black font-medium ${sora.className}`}>
                        {requester.major || "No major listed"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(requester.id)}
                      className={`bg-[#00a651] hover:bg-[#008a43] text-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeclineRequest(requester.id)}
                      className={`bg-white hover:bg-black/5 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ) : null
            )}
            {requestsReceived.length === 0 && (
              <p className={`text-center text-black/60 py-8 ${sora.className}`}>
                No pending requests
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Requests Sent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
        <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
          <h3
            className={`flex items-center gap-2 text-xl font-extrabold text-black mb-4 uppercase ${bricolage.className}`}
          >
            <Send className="h-6 w-6" />
            Requests Sent ({requestsSent.length})
          </h3>
          <div className="space-y-3">
            {requestsSent.map(({ recipient, sentAt }) =>
              recipient ? (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-4 border-2 border-black bg-black/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                      <div className="relative w-12 h-12 bg-[#ffb81c] border-2 border-black flex items-center justify-center overflow-hidden">
                        {recipient.photoUrl ? (
                          <img
                            src={recipient.photoUrl}
                            alt={`${recipient.firstName} ${recipient.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className={`text-black font-bold ${bricolage.className}`}
                          >
                            {getInitials(
                              recipient.firstName,
                              recipient.lastName
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`font-extrabold text-black ${bricolage.className}`}>
                        {recipient.firstName} {recipient.lastName}
                      </p>
                      <p className={`text-sm text-black font-medium ${sora.className}`}>
                        Sent {new Date(sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCancelRequest(recipient.id)}
                    className={`bg-white hover:bg-black/5 text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold`}
                  >
                    Cancel
                  </Button>
                </div>
              ) : null
            )}
            {requestsSent.length === 0 && (
              <p className={`text-center text-black/60 py-8 ${sora.className}`}>
                No pending requests
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className={`${bricolage.variable} ${sora.variable} space-y-6 p-4 lg:p-8`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8">
            <h1 className={`text-4xl font-extrabold mb-2 text-black uppercase ${bricolage.className}`}>
              Friends
            </h1>
            <p className={`text-lg text-black font-medium ${sora.className}`}>
              Connect with other NSBE members
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="grid grid-cols-3 border-b-4 border-black">
              {[
                { id: "directory", label: "Directory", icon: Search },
                { id: "friends", label: `My Friends (${friends.length})`, icon: Users },
                {
                  id: "requests",
                  label: `Requests (${requestsReceived.length})`,
                  icon: Inbox,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center gap-2 px-4 py-4 border-r-4 last:border-r-0 border-black transition-all ${
                      activeTab === tab.id
                        ? "bg-[#00a651] text-white"
                        : "bg-white text-black hover:bg-black/5"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span
                      className={`font-bold text-sm md:text-base ${bricolage.className}`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="p-6">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
                </div>
              )}
              {!loading && activeTab === "directory" && renderDirectory()}
              {!loading && activeTab === "friends" && renderFriends()}
              {!loading && activeTab === "requests" && renderRequests()}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

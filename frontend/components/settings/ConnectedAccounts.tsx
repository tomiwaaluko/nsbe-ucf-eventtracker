import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Link as LinkIcon,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ConnectedAccount {
  id: string;
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  username?: string;
  connectedAt?: string;
  canDisconnect: boolean;
}

export function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    {
      id: "nsbe",
      name: "NSBE National",
      icon: "🎓",
      description: "Sync your national NSBE membership ID",
      isConnected: false,
      canDisconnect: true,
    },
    {
      id: "github",
      name: "GitHub",
      icon: "💻",
      description: "Connect your GitHub profile for tech events",
      isConnected: true,
      username: "johndoe",
      connectedAt: "Connected 3 months ago",
      canDisconnect: true,
    },
    {
      id: "google",
      name: "Google",
      icon: "🔍",
      description: "Used for quick sign-in and calendar sync",
      isConnected: true,
      username: "john.doe@ucf.edu",
      connectedAt: "Connected 6 months ago",
      canDisconnect: false,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "💼",
      description: "Showcase your NSBE involvement on your profile",
      isConnected: false,
      canDisconnect: true,
    },
    {
      id: "discord",
      name: "Discord",
      icon: "💬",
      description: "Join the NSBE UCF Discord community",
      isConnected: false,
      canDisconnect: true,
    },
  ]);

  const [nsbeMembershipId, setNsbeMembershipId] = useState("");
  const [showNsbeInput, setShowNsbeInput] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleConnect = async (accountId: string) => {
    if (accountId === "nsbe") {
      if (!showNsbeInput) {
        setShowNsbeInput(true);
        return;
      }

      if (!nsbeMembershipId) {
        toast.error("NSBE ID required", {
          description: "Please enter your NSBE membership ID.",
        });
        return;
      }
    }

    setIsLoading(accountId);

    // Simulate API call
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                isConnected: true,
                username: accountId === "nsbe" ? nsbeMembershipId : "johndoe",
                connectedAt: "Just now",
              }
            : acc
        )
      );

      setIsLoading(null);
      setShowNsbeInput(false);
      setNsbeMembershipId("");

      const account = accounts.find((a) => a.id === accountId);
      toast.success("Account connected!", {
        description: `${account?.name} has been successfully connected.`,
      });
    }, 1500);
  };

  const handleDisconnect = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);

    if (!account?.canDisconnect) {
      toast.error("Cannot disconnect", {
        description: "This account is required for authentication.",
      });
      return;
    }

    setIsLoading(accountId);

    // Simulate API call
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                isConnected: false,
                username: undefined,
                connectedAt: undefined,
              }
            : acc
        )
      );

      setIsLoading(null);

      toast.success("Account disconnected", {
        description: `${account?.name} has been disconnected.`,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <LinkIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Connected Accounts</h4>
            <p className="text-sm text-blue-800">
              Link external accounts to enhance your NSBE experience. Your data remains
              private and secure.
            </p>
          </div>
        </div>
      </div>

      {/* Connected Accounts List */}
      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`bg-white border-2 rounded-lg p-4 sm:p-5 transition-all ${
              account.isConnected ? "border-[#00843D]/20 bg-[#00843D]/5" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Icon and Info */}
              <div className="flex items-start gap-3 flex-1">
                <div className="text-4xl flex-shrink-0">{account.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    {account.isConnected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#00843D] text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{account.description}</p>

                  {account.isConnected && account.username && (
                    <div className="text-sm">
                      <p className="text-gray-700 font-medium">{account.username}</p>
                      {account.connectedAt && (
                        <p className="text-xs text-gray-500">{account.connectedAt}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {account.isConnected ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {account.id === "nsbe" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Profile
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                      disabled={!account.canDisconnect || isLoading === account.id}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isLoading === account.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <Unlink className="h-4 w-4" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(account.id)}
                    disabled={isLoading === account.id}
                    className="bg-[#00843D] hover:bg-[#006830] text-white"
                    size="sm"
                  >
                    {isLoading === account.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* NSBE ID Input */}
            {account.id === "nsbe" && showNsbeInput && !account.isConnected && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="nsbeMemberId">NSBE Membership ID</Label>
                    <Input
                      id="nsbeMemberId"
                      type="text"
                      placeholder="Enter your NSBE ID (e.g., 123456)"
                      value={nsbeMembershipId}
                      onChange={(e) => setNsbeMembershipId(e.target.value)}
                      disabled={isLoading === "nsbe"}
                    />
                    <p className="text-xs text-gray-500">
                      Find your membership ID on your NSBE National profile or membership card
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNsbeInput(false);
                        setNsbeMembershipId("");
                      }}
                      disabled={isLoading === "nsbe"}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleConnect("nsbe")}
                      disabled={isLoading === "nsbe" || !nsbeMembershipId}
                      className="bg-[#00843D] hover:bg-[#006830] text-white"
                      size="sm"
                    >
                      {isLoading === "nsbe" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Connect"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for Primary Account */}
            {account.id === "google" && account.isConnected && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    This is your primary authentication method and cannot be disconnected.
                    To remove it, please add another sign-in method first.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Why Connect Accounts?</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>🎯</span> NSBE National
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Sync your national membership status</li>
              <li>• Access national event discounts</li>
              <li>• Export your chapter progress to national</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>💻</span> GitHub
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Showcase coding projects at events</li>
              <li>• Connect with other tech-focused members</li>
              <li>• Track technical workshop participation</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-50/50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>💼</span> LinkedIn
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Display NSBE involvement on your profile</li>
              <li>• Auto-generate certifications for events</li>
              <li>• Network with NSBE alumni professionals</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-50/50 rounded-lg p-4 border border-indigo-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>💬</span> Discord
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Join the NSBE UCF community server</li>
              <li>• Get real-time event notifications</li>
              <li>• Participate in study groups and discussions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
          <span>🔒</span> Security & Privacy
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• We only request the minimum permissions needed</li>
          <li>• Your credentials are never stored on our servers</li>
          <li>• You can disconnect any account at any time</li>
          <li>• All connections use secure OAuth 2.0 authentication</li>
          <li>• We never post or share anything without your permission</li>
        </ul>
      </div>
    </div>
  );
}

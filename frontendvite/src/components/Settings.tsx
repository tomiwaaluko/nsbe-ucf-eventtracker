import { useState } from "react";
import { Button } from "./ui/button";
import { User, Lock, Bell, Palette, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { ProfileSettings } from "./settings/ProfileSettings";
import { AccountSettings } from "./settings/AccountSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { AppearanceSettings } from "./settings/AppearanceSettings";
import { ConnectedAccounts } from "./settings/ConnectedAccounts";

interface SettingsProps {
  onBack: () => void;
  memberData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    major?: string;
    graduationYear?: number;
    profilePhoto?: string;
  };
}

type SettingsTab = "profile" | "account" | "notifications" | "appearance" | "connections";

export function Settings({ onBack, memberData }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabs = [
    {
      id: "profile" as const,
      label: "Profile",
      icon: User,
      description: "Manage your personal information",
    },
    {
      id: "account" as const,
      label: "Account",
      icon: Lock,
      description: "Security and account preferences",
    },
    {
      id: "notifications" as const,
      label: "Notifications",
      icon: Bell,
      description: "Email and push notification settings",
    },
    {
      id: "appearance" as const,
      label: "Appearance",
      icon: Palette,
      description: "Customize your experience",
    },
    {
      id: "connections" as const,
      label: "Connected Accounts",
      icon: LinkIcon,
      description: "Manage linked accounts",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? "bg-[#00843D] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#00843D] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium text-center">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tab Header - Desktop */}
              <div className="hidden lg:block border-b border-gray-200 px-6 py-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  if (tab.id === activeTab) {
                    return (
                      <div key={tab.id} className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#00843D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-[#00843D]" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{tab.label}</h2>
                          <p className="text-sm text-gray-600">{tab.description}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === "profile" && <ProfileSettings memberData={memberData} />}
                {activeTab === "account" && <AccountSettings memberData={memberData} />}
                {activeTab === "notifications" && <NotificationSettings />}
                {activeTab === "appearance" && <AppearanceSettings />}
                {activeTab === "connections" && <ConnectedAccounts />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

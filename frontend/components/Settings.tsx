// GitHub Copilot: Redesign this Settings page to be a clean, modern preferences panel.
// Requirements:
// - Same gradient background and glass container as Login.
// - Use a single centered glass card (max-w-2xl) with section headers: "Profile", "Notifications", "Account" etc.
// - Group related settings with subtle dividers and spacing.
// - Use consistent input styles as the Login form (rounded-lg, focus border, soft shadow).
// - Preserve all existing form fields, bindings, and handlers; only change the styling and layout.

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Palette,
  Link as LinkIcon,
  ArrowLeft,
  Sparkles,
  Settings as SettingsIcon,
} from "lucide-react";
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

type SettingsTab =
  | "profile"
  | "account"
  | "notifications"
  | "appearance"
  | "connections";

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#008a44] to-[#006830]">
        {/* Animated orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-[#ffb81c] rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-[#ed1c24] rounded-full blur-3xl opacity-20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Back</span>
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">Settings</h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <Sparkles className="w-4 h-4 text-[#ffb81c]" />
                    <span className="text-sm font-medium text-white">
                      Customize
                    </span>
                  </div>
                </div>
                <p className="text-white/90 text-sm mt-1 hidden sm:block">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="hidden lg:block lg:col-span-1"
            >
              <nav className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2 sticky top-24 shadow-2xl">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                        activeTab === tab.id
                          ? "bg-white text-[#00a651] shadow-lg"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </motion.div>

            {/* Mobile Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:hidden"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-2xl">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.3 + index * 0.05,
                          duration: 0.4,
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                          activeTab === tab.id
                            ? "bg-white text-[#00a651] shadow-lg"
                            : "text-white hover:bg-white/20"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium text-center">
                          {tab.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                {/* Tab Header - Desktop */}
                <div className="hidden lg:block border-b border-white/20 px-6 py-5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    if (tab.id === activeTab) {
                      return (
                        <motion.div
                          key={tab.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              {tab.label}
                            </h2>
                            <p className="text-sm text-white/80">
                              {tab.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Tab Content */}
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="p-4 sm:p-6"
                >
                  {activeTab === "profile" && (
                    <ProfileSettings memberData={memberData} />
                  )}
                  {activeTab === "account" && (
                    <AccountSettings memberData={memberData} />
                  )}
                  {activeTab === "notifications" && <NotificationSettings />}
                  {activeTab === "appearance" && <AppearanceSettings />}
                  {activeTab === "connections" && <ConnectedAccounts />}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

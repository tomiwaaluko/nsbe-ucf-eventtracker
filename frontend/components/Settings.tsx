// Brutalist/Geometric Design System for NSBE UCF Settings
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Palette,
  Link as LinkIcon,
  ArrowLeft,
  Zap,
  Settings as SettingsIcon,
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
    <div
      className={`${bricolage.variable} ${sora.variable} min-h-screen relative overflow-hidden font-sans`}
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Brutalist background */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />
        <motion.div
          animate={{
            rotate: [0, 2, -2, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 -right-24 w-[600px] h-[600px] bg-[#ffb81c] opacity-15"
          style={{
            clipPath: "polygon(40% 0%, 100% 0%, 60% 100%, 0% 100%)",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{
                scale: 1.05,
                x: -5,
                boxShadow: "4px 4px 0 0 rgba(0,0,0,1)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black hover:bg-black/5 transition-all font-bold"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline uppercase tracking-wide">Back</span>
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                <div className="relative w-12 h-12 bg-[#ffb81c] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-black" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1
                    className={`text-4xl lg:text-5xl font-extrabold text-white ${bricolage.className} tracking-tight`}
                  >
                    Settings
                  </h1>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ed1c24] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <Zap className="w-4 h-4 text-black" />
                    <span
                      className={`text-sm font-bold uppercase tracking-wider ${bricolage.className} text-black`}
                    >
                      Customize
                    </span>
                  </div>
                </div>
                <p
                  className={`${sora.className} text-white/90 text-sm mt-1 hidden sm:block font-medium`}
                >
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
              initial={{ opacity: 0, x: -30, rotate: -1 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
              className="hidden lg:block lg:col-span-1"
            >
              <nav className="relative">
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
                <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-2 sticky top-24">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 border-2 transition-all text-left font-bold ${
                        activeTab === tab.id
                          ? "bg-[#00a651] text-white border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                          : "text-black border-black hover:bg-black/5"
                      }`}
                      style={{ fontFamily: "var(--font-bricolage)" }}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  );
                })}
                </div>
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
              initial={{ opacity: 0, y: 30, rotate: 1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
                <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  {/* Tab Header - Desktop */}
                  <div className="hidden lg:block border-b-4 border-black px-6 py-5">
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
                          <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h2
                              className={`text-xl font-extrabold text-black ${bricolage.className} uppercase tracking-wide`}
                            >
                              {tab.label}
                            </h2>
                            <p
                              className={`text-sm ${sora.className} text-black/70 font-medium`}
                            >
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

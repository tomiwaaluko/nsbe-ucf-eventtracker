// Brutalist/Geometric Design System for NSBE UCF Onboarding
// Matching Login and Dashboard styling
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Target,
  Users,
  Zap,
  Calendar,
  Award,
  QrCode,
  LayoutDashboard,
  History,
  Loader2,
} from "lucide-react";
import { Bricolage_Grotesque, Sora } from "next/font/google";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

interface OnboardingProps {
  onComplete: () => void;
  userName: string;
}

export function Onboarding({ onComplete, userName }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [chapterDuesPaid, setChapterDuesPaid] = useState(false);
  const [nationalDuesPaid, setNationalDuesPaid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasCompletedRef = useRef(false);

  const finishOnboarding = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    onComplete();
  };

  const tourSteps = [
    {
      id: "welcome",
      icon: "👋",
      title: `Welcome, ${userName}!`,
      subtitle: "Let's get you started with NSBE UCF Event Tracker",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <p
              className={`text-lg text-black/70 max-w-md mx-auto ${sora.className}`}
            >
              We're excited to have you join the NSBE UCF community! This quick
              tour will help you understand how to track your involvement and
              progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              {
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: "Track Events",
                desc: "Monitor your attendance at workshops, GBMs, and service events",
                color: "#00a651",
                delay: 0.4,
              },
              {
                icon: <Trophy className="h-6 w-6" />,
                title: "Reach Goals",
                desc: "Complete your 1-1-1 and 3-3-3 requirements",
                color: "#ffb81c",
                delay: 0.5,
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Stay Connected",
                desc: "Never miss important NSBE events and activities",
                color: "#ed1c24",
                delay: 0.6,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: item.delay, duration: 0.5 }}
                whileHover={{ rotate: 1, scale: 1.02, y: -4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                <div
                  className="relative border-4 border-black p-6 text-center"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="w-14 h-14 bg-black/20 border-2 border-black flex items-center justify-center mx-auto mb-3">
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <h3
                    className={`font-bold text-black mb-1 ${bricolage.className}`}
                  >
                    {item.title}
                  </h3>
                  <p className={`text-sm text-black/70 ${sora.className}`}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "111-explained",
      icon: "1️⃣",
      title: "Understanding 1-1-1",
      subtitle: "Your foundation as a NSBE-UCF member",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
            <div className="relative bg-[#00a651] border-4 border-black p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`text-5xl md:text-6xl font-extrabold text-white ${bricolage.className}`}
                >
                  1-1-1
                </div>
                <div className="h-16 w-1 bg-white/30" />
                <div>
                  <h3
                    className={`text-xl md:text-2xl font-bold text-white ${bricolage.className}`}
                  >
                    Minimum Requirement
                  </h3>
                  <p className={`text-white/90 ${sora.className}`}>
                    To be eligible for Region III Fall Regional Conference
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                num: "1",
                title: "Workshop / Social Event",
                tag: "SOCIAL_AEX",
                tagColor: "bg-purple-500",
                desc: "Attend at least one professional development workshop, technical training, or social/academic excellence event.",
                example:
                  "Examples: Resume workshops, coding sessions, networking mixers, study groups",
                borderColor: "#00a651",
                bgColor: "#00a651",
                delay: 0.3,
              },
              {
                num: "1",
                title: "General Body Meeting (GBM)",
                tag: "GBM",
                tagColor: "bg-blue-500",
                desc: "Attend at least one chapter meeting to stay informed about chapter activities, initiatives, and opportunities.",
                example:
                  "Usually held twice a month to engage with members and stay updated on upcoming events.",
                borderColor: "#ffb81c",
                bgColor: "#ffb81c",
                delay: 0.4,
              },
              {
                num: "1",
                title: "Community Service / Fundraiser",
                tag: "SERVICE",
                tagColor: "bg-green-500",
                desc: "Participate in at least one community service project or fundraising event to give back to the community.",
                example:
                  "Examples: Food drives, tutoring, beach cleanups, STEM outreach, fundraising events",
                borderColor: "#ed1c24",
                bgColor: "#ed1c24",
                delay: 0.5,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.delay, duration: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                <div
                  className="relative bg-white border-4 border-black p-5"
                  style={{
                    borderLeftColor: item.borderColor,
                    borderLeftWidth: "8px",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-14 h-14 border-2 border-black flex items-center justify-center"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <span
                        className={`text-2xl font-extrabold ${bricolage.className} ${
                          item.bgColor === "#ffb81c"
                            ? "text-black"
                            : "text-white"
                        }`}
                      >
                        {item.num}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-bold text-black mb-1 flex items-center gap-2 flex-wrap ${bricolage.className}`}
                      >
                        {item.title}
                        <span
                          className={`text-xs ${item.tagColor} text-white px-2 py-0.5 border border-black font-medium`}
                        >
                          {item.tag}
                        </span>
                      </h4>
                      <p
                        className={`text-black/70 text-sm mb-2 ${sora.className}`}
                      >
                        {item.desc}
                      </p>
                      <p
                        className={`text-xs text-black/50 italic ${sora.className}`}
                      >
                        {item.example}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
            <div className="relative bg-[#ffb81c] border-4 border-black p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-black flex-shrink-0" />
              <p className={`text-sm text-black ${sora.className}`}>
                <span className="font-bold">Pro Tip:</span> Complete your 1-1-1
                early in the semester to be first priority in FRC selection!
              </p>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "333-explained",
      icon: "3️⃣",
      title: "Understanding 3-3-3",
      subtitle: "Strive for excellence and deeper involvement",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
            <div className="relative bg-[#ffb81c] border-4 border-black p-6">
              <div className="flex items-center gap-4">
                <Trophy className="h-12 w-12 md:h-16 md:w-16 text-black" />
                <div>
                  <div
                    className={`text-5xl md:text-6xl font-extrabold text-black ${bricolage.className}`}
                  >
                    3-3-3
                  </div>
                  <p
                    className={`text-lg font-medium text-black ${sora.className}`}
                  >
                    Requirement for Annual Convention
                  </p>
                  <p className={`text-black/70 ${sora.className}`}>
                    For highly engaged members
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
            <div className="relative bg-white border-4 border-black p-5">
              <h3
                className={`font-bold text-black mb-3 flex items-center gap-2 ${bricolage.className} uppercase`}
              >
                <Target className="h-5 w-5 text-[#ffb81c]" />
                Why Aim for 3-3-3?
              </h3>
              <ul
                className={`space-y-2 text-sm text-black/80 ${sora.className}`}
              >
                {[
                  "Maximize your professional development and networking opportunities",
                  "Build stronger connections within the NSBE community",
                  "Make a greater impact through community service",
                  "Demonstrate exceptional commitment to potential employers",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#00a651] font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: "3",
                title: "Workshops/Social Event",
                desc: "Attend three workshops, trainings, or social/academic events.",
                color: "#00a651",
                textColor: "text-white",
                delay: 0.4,
              },
              {
                num: "3",
                title: "GBMs",
                desc: "Attend three general body meetings to stay fully engaged with chapter activities",
                color: "#ffb81c",
                textColor: "text-black",
                delay: 0.5,
              },
              {
                num: "3",
                title: "Service Events",
                desc: "Participate in three community service or fundraising events.",
                color: "#ed1c24",
                textColor: "text-white",
                delay: 0.6,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.delay, duration: 0.4 }}
                whileHover={{ rotate: 1, scale: 1.02 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                <div
                  className="relative border-4 border-black p-5 text-center"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="w-14 h-14 bg-black/20 border-2 border-black flex items-center justify-center mx-auto mb-3">
                    <span
                      className={`text-2xl font-extrabold ${bricolage.className} ${item.textColor}`}
                    >
                      {item.num}
                    </span>
                  </div>
                  <h4
                    className={`font-bold mb-2 ${bricolage.className} ${
                      item.textColor === "text-black"
                        ? "text-black"
                        : "text-white"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-sm ${sora.className} ${
                      item.textColor === "text-black"
                        ? "text-black/70"
                        : "text-white/80"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
            <div className="relative bg-[#ffb81c] border-4 border-black p-4 flex items-start gap-3">
              <Trophy className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p
                  className={`font-bold text-black mb-1 ${bricolage.className}`}
                >
                  Recognition & Benefits
                </p>
                <p className={`text-sm text-black/80 ${sora.className}`}>
                  Members who achieve 3-3-3 receive special recognition,
                  priority access to exclusive events, and enhanced leadership
                  opportunities within the chapter.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "how-to-use",
      icon: "📱",
      title: "How to Use the Tracker",
      subtitle: "Quick guide to checking in and tracking progress",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
            <div className="relative bg-[#0a0a0a] border-4 border-black p-6">
              <h3
                className={`text-2xl font-bold text-white mb-2 ${bricolage.className}`}
              >
                Getting Started is Easy!
              </h3>
              <p className={`text-white/80 ${sora.className}`}>
                Follow these simple steps to track your journey
              </p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                num: "1",
                icon: <QrCode className="h-5 w-5" />,
                title: "Check In at Events",
                desc: "When you arrive at an event, scan the QR code displayed by event organizers or use the manual check-in option.",
                extra: (
                  <div className="bg-black/5 border-2 border-black p-3 mt-3">
                    <p
                      className={`text-xs text-black/70 mb-2 font-bold uppercase ${bricolage.className}`}
                    >
                      Event Check-In Options:
                    </p>
                    <ul
                      className={`text-xs text-black/60 space-y-1 ${sora.className}`}
                    >
                      <li>
                        • <span className="font-medium">QR Code:</span> Scan the
                        code at the event
                      </li>
                      <li>
                        • <span className="font-medium">Manual:</span> Officers
                        can check you in directly
                      </li>
                    </ul>
                  </div>
                ),
                color: "#00a651",
                delay: 0.3,
              },
              {
                num: "2",
                icon: <LayoutDashboard className="h-5 w-5" />,
                title: "View Your Dashboard",
                desc: "Your dashboard shows your progress toward 1-1-1 and 3-3-3 goals in real-time with visual progress bars and charts.",
                extra: (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: "Workshops", value: "2/3", color: "#ffb81c" },
                      { label: "GBMs", value: "3/3", color: "#00a651" },
                      { label: "Service", value: "1/3", color: "#ed1c24" },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="border-2 border-black p-2 text-center"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        <p
                          className={`text-xs text-black/60 mb-1 ${sora.className}`}
                        >
                          {stat.label}
                        </p>
                        <p
                          className={`font-bold text-black ${bricolage.className}`}
                          style={{ color: stat.color }}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ),
                color: "#ffb81c",
                delay: 0.4,
              },
              {
                num: "3",
                icon: <Calendar className="h-5 w-5" />,
                title: "Browse Upcoming Events",
                desc: "Check the Events page to see what's coming up and plan your attendance to reach your goals.",
                extra: (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {[
                      { label: "Workshops", color: "#ffb81c" },
                      { label: "GBMs", color: "#00a651" },
                      { label: "Service", color: "#ed1c24" },
                    ].map((tag, i) => (
                      <span
                        key={i}
                        className={`text-xs px-3 py-1 border-2 border-black font-medium ${sora.className}`}
                        style={{
                          backgroundColor: tag.color,
                          color: tag.color === "#ffb81c" ? "black" : "white",
                        }}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                ),
                color: "#ed1c24",
                delay: 0.5,
              },
              {
                num: "4",
                icon: <History className="h-5 w-5" />,
                title: "Track Your History",
                desc: "View your complete attendance history in your profile to see all the events you've attended and your overall progress.",
                extra: null,
                color: "#0a0a0a",
                delay: 0.6,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.delay, duration: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                <div className="relative bg-white border-4 border-black p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 border-2 border-black flex items-center justify-center"
                      style={{ backgroundColor: item.color }}
                    >
                      <span
                        className={`text-xl font-extrabold ${bricolage.className} ${
                          item.color === "#ffb81c" ? "text-black" : "text-white"
                        }`}
                      >
                        {item.num}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-bold text-black mb-1 flex items-center gap-2 ${bricolage.className}`}
                      >
                        {item.title}
                      </h4>
                      <p className={`text-black/70 text-sm ${sora.className}`}>
                        {item.desc}
                      </p>
                      {item.extra}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
            <div className="relative bg-[#00a651] border-4 border-black p-4 flex items-center gap-3">
              <Target className="w-5 h-5 text-white flex-shrink-0" />
              <p className={`text-sm text-white ${sora.className}`}>
                <span className="font-bold">Remember:</span> Your attendance is
                automatically tracked once you check in. Just focus on engaging
                with events and building your professional network!
              </p>
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  const duesStep = {
    id: "dues",
    icon: "💳",
    title: "Membership Dues",
    subtitle: "Self-reported chapter and national NSBE dues status",
    content: (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
          <div className="relative bg-[#ffb81c] border-4 border-black p-5">
            <p className={`text-sm text-black ${sora.className}`}>
              Honor-system checkboxes only — no receipt upload required. You can
              update these later in Settings if you pay dues after sign-up.
            </p>
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
            <div className="relative bg-white border-4 border-black p-5 flex items-start gap-4">
              <Checkbox
                id="onboarding-chapter-dues"
                checked={chapterDuesPaid}
                onCheckedChange={(checked) =>
                  setChapterDuesPaid(checked === true)
                }
                className="mt-1 border-black data-[state=checked]:bg-[#00a651]"
              />
              <Label
                htmlFor="onboarding-chapter-dues"
                className={`cursor-pointer ${sora.className}`}
              >
                <span
                  className={`block font-bold text-black mb-1 ${bricolage.className}`}
                >
                  NSBE UCF Chapter Dues
                </span>
                <span className="text-sm text-black/70">
                  I have paid chapter dues for this academic year.
                </span>
              </Label>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
            <div className="relative bg-white border-4 border-black p-5 flex items-start gap-4">
              <Checkbox
                id="onboarding-national-dues"
                checked={nationalDuesPaid}
                onCheckedChange={(checked) =>
                  setNationalDuesPaid(checked === true)
                }
                className="mt-1 border-black data-[state=checked]:bg-[#00a651]"
              />
              <Label
                htmlFor="onboarding-national-dues"
                className={`cursor-pointer ${sora.className}`}
              >
                <span
                  className={`block font-bold text-black mb-1 ${bricolage.className}`}
                >
                  National NSBE Dues
                </span>
                <span className="text-sm text-black/70">
                  I have paid national NSBE membership dues for this academic
                  year.
                </span>
              </Label>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  const steps = [...tourSteps, duesStep];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.updateMyDuesStatus(token, {
          chapterDuesSelfReported: chapterDuesPaid,
          nationalDuesSelfReported: nationalDuesPaid,
        });
      }
    } catch (error) {
      console.error("Failed to save dues status:", error);
      toast.error("Save failed", {
        description: "Could not save your dues status. You can update it later in Settings.",
      });
    } finally {
      setIsSaving(false);
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

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

      {/* Brutalist background with geometric shapes */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Base green gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />

        {/* Diagonal geometric shapes */}
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
        <motion.div
          animate={{
            rotate: [0, -3, 3, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-[#ed1c24] opacity-[0.12]"
          style={{
            clipPath: "polygon(0% 0%, 60% 0%, 100% 100%, 40% 100%)",
            transform: "rotate(12deg)",
          }}
        />

        {/* Grid pattern overlay */}
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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-sm font-bold text-white uppercase tracking-wider ${bricolage.className}`}
              >
                Step {currentStep + 1} of {steps.length}
              </span>
              <button
                onClick={finishOnboarding}
                disabled={isSaving}
                className={`text-sm text-white/60 hover:text-white transition-colors font-medium ${sora.className} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Skip Tutorial
              </button>
            </div>
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={`h-2 flex-1 border-2 border-black transition-all origin-left ${
                    index <= currentStep ? "bg-[#00a651]" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50, rotate: 1 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-4 translate-y-4" />
            <div className="relative bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6 md:p-10">
              {/* Diagonal corner accent */}
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-[#ffb81c]" />

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-6xl mb-4"
                >
                  {currentStepData.icon}
                </motion.div>
                <h1
                  className={`text-3xl md:text-4xl font-extrabold text-black mb-2 tracking-tight ${bricolage.className}`}
                >
                  {currentStepData.title}
                </h1>
                <p className={`text-black/60 ${sora.className}`}>
                  {currentStepData.subtitle}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">{currentStepData.content}</div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t-4 border-black">
                <motion.button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  whileHover={currentStep > 0 ? { x: -4 } : {}}
                  whileTap={currentStep > 0 ? { scale: 0.98 } : {}}
                  className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider border-4 border-black transition-all text-black ${bricolage.className} ${
                    currentStep === 0
                      ? "invisible"
                      : "bg-white hover:bg-black/5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </motion.button>

                <div className="flex gap-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`h-3 border-2 border-black transition-all ${
                        index === currentStep
                          ? "bg-[#00a651] w-8"
                          : index < currentStep
                            ? "bg-[#00a651]/50 w-3"
                            : "bg-black/20 w-3"
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={handleNext}
                  disabled={isSaving}
                  whileHover={
                    isSaving
                      ? {}
                      : {
                          scale: 1.02,
                          boxShadow: "8px 8px 0 0 rgba(0,0,0,1)",
                          x: 4,
                          y: 4,
                        }
                  }
                  whileTap={
                    isSaving
                      ? {}
                      : {
                          scale: 0.98,
                          x: 8,
                          y: 8,
                          boxShadow: "4px 4px 0 0 rgba(0,0,0,1)",
                        }
                  }
                  className={`flex items-center gap-2 px-6 py-3 bg-[#00a651] text-white font-bold uppercase tracking-wider border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:bg-[#008a44] ${bricolage.className} disabled:opacity-60`}
                >
                  {isSaving ? (
                    <>
                      Saving...
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : currentStep === steps.length - 1 ? (
                    <>
                      Get Started
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className={`text-sm text-white/50 ${sora.className}`}>
              Questions?{" "}
              <a
                href="mailto:support@nsbeucf.org"
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Contact Support
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

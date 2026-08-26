"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Bricolage_Grotesque, Sora } from "next/font/google";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  formatChangelogDate,
  getChangelogEntries,
  markChangelogAsRead,
} from "@/lib/changelog";

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

export default function ChangelogPage() {
  const entries = getChangelogEntries();

  useEffect(() => {
    markChangelogAsRead();
  }, []);

  return (
    <DashboardLayout>
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
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 p-6 lg:p-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                  <div className="relative bg-[#00a651] border-2 border-black p-2">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1
                  className={`text-3xl lg:text-4xl font-extrabold text-white ${bricolage.className}`}
                >
                  What&apos;s new
                </h1>
              </div>
              <p className={`text-white/80 ${sora.className}`}>
                Recent updates to the NSBE UCF Event Tracker.
              </p>
            </div>

            <div className="space-y-4">
              {entries.map((entry, index) => (
                <motion.article
                  key={entry.version}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                  <div className="relative bg-white border-4 border-black p-5 lg:p-6">
                    <time
                      dateTime={entry.date}
                      className={`block text-sm font-bold text-[#00a651] mb-2 ${sora.className}`}
                    >
                      {formatChangelogDate(entry.date)}
                    </time>
                    <p className={`text-black ${sora.className}`}>
                      {entry.summary}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

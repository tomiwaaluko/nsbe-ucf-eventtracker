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
        className={`min-h-screen bg-[#f5f5f0] p-6 lg:p-10 ${bricolage.variable} ${sora.variable}`}
      >
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
                className={`text-3xl lg:text-4xl font-extrabold text-black ${bricolage.className}`}
              >
                What&apos;s new
              </h1>
            </div>
            <p className={`text-black/60 ${sora.className}`}>
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
    </DashboardLayout>
  );
}

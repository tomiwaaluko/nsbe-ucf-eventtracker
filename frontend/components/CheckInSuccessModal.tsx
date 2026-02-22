"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, Calendar, MapPin, Clock, Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

interface CheckInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInData: {
    event: {
      name: string;
      category: string;
      location?: string;
      startTime: string | Date;
    };
    checkedInAt: string | Date;
  } | null;
}

export function CheckInSuccessModal({
  isOpen,
  onClose,
  checkInData,
}: CheckInSuccessModalProps) {
  const [countdown, setCountdown] = useState(5);

  // Auto-close countdown
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onClose();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      GBM: "#00a651",
      WORKSHOP: "#ffb81c",
      SOCIAL: "#00a651",
      SOCIAL_AEX: "#ffb81c",
      FUNDRAISER: "#ed1c24",
      COMMUNITY_SERVICE: "#ed1c24",
      COMMITTEE_PARTICIPATION: "#ffb81c",
    };
    return colors[category] || "#00a651";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      GBM: "General Body Meeting",
      WORKSHOP: "Workshop",
      SOCIAL: "Social Event",
      SOCIAL_AEX: "Workshop / Social",
      FUNDRAISER: "Fundraiser",
      COMMUNITY_SERVICE: "Community Service",
      COMMITTEE_PARTICIPATION: "Committee Participation",
    };
    return labels[category] || category.replace(/_/g, " ");
  };

  if (!checkInData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent
            className={`${bricolage.variable} ${sora.variable} sm:max-w-md bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-0 overflow-hidden`}
          >
            {/* Custom Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-10 h-10 bg-black/5 border-2 border-black hover:bg-black/10 flex items-center justify-center z-50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-black" />
            </button>

            <div className="p-6">
              <DialogHeader>
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
                  className="mx-auto mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                    <div className="relative w-20 h-20 bg-[#00a651] border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
                    </div>
                  </div>
                </motion.div>

                <DialogTitle
                  className={`text-2xl text-center mb-2 ${bricolage.className} font-extrabold uppercase tracking-tight text-black`}
                >
                  Check-in Successful!
                </DialogTitle>

                <DialogDescription
                  className={`text-center ${sora.className} text-black/70 font-medium`}
                >
                  You&apos;ve been checked into the following event
                </DialogDescription>
              </DialogHeader>

              {/* Event Details */}
              <div className="space-y-4 py-6">
                {/* Event Name */}
                <div className="text-center">
                  <h3
                    className={`text-xl font-bold mb-3 ${bricolage.className} text-black`}
                  >
                    {checkInData.event.name}
                  </h3>
                  <div className="inline-flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                      <div
                        className={`relative px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${bricolage.className} font-bold uppercase text-xs text-white`}
                        style={{
                          backgroundColor: getCategoryColor(
                            checkInData.event.category
                          ),
                        }}
                      >
                        {getCategoryLabel(checkInData.event.category)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div className="space-y-3 bg-black/5 p-5 border-2 border-black">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs text-black/60 font-medium ${sora.className} block`}
                      >
                        Checked in at
                      </span>
                      <span
                        className={`font-bold text-black ${bricolage.className}`}
                      >
                        {new Date(
                          checkInData.checkedInAt
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs text-black/60 font-medium ${sora.className} block`}
                      >
                        Event date
                      </span>
                      <span
                        className={`font-bold text-black ${bricolage.className}`}
                      >
                        {new Date(
                          checkInData.event.startTime
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {checkInData.event.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs text-black/60 font-medium ${sora.className} block`}
                        >
                          Location
                        </span>
                        <span
                          className={`font-bold text-black ${bricolage.className}`}
                        >
                          {checkInData.event.location}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Achievement Progress */}
                  <div className="flex items-center gap-3 pt-3 border-t-2 border-black/20">
                    <div className="w-8 h-8 bg-[#ffb81c] border-2 border-black flex items-center justify-center flex-shrink-0">
                      <Award className="h-4 w-4 text-black" />
                    </div>
                    <span
                      className={`font-bold text-black ${bricolage.className} text-sm`}
                    >
                      +1 event towards 3-3-3 goal!
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-col gap-3 pt-2">
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    x: 2,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => (window.location.href = "/my-attendance")}
                  className={`w-full bg-white text-black py-3 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wider transition-all duration-200 ${bricolage.className} text-sm hover:bg-black/5`}
                >
                  View My Attendance
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    x: 2,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`w-full bg-[#00a651] text-white py-3 px-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wider transition-all duration-200 ${bricolage.className} text-sm hover:bg-[#008a44]`}
                >
                  Close ({countdown}s)
                </motion.button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

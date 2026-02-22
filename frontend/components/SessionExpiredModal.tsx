"use client";

import { motion } from "framer-motion";
import { AlertCircle, LogIn } from "lucide-react";
import { Button } from "./ui/button";
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

interface SessionExpiredModalProps {
  isOpen: boolean;
  onSignIn: () => void;
}

export function SessionExpiredModal({ isOpen, onSignIn }: SessionExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50"
        onClick={onSignIn}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={`relative z-10 w-full max-w-md ${bricolage.variable} ${sora.variable}`}
      >
        <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
        <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
              <div className="relative w-20 h-20 bg-[#ed1c24] border-4 border-black flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-extrabold text-black mb-3 uppercase ${bricolage.className}`}>
              Session Expired
            </h2>
            <p className={`text-lg text-black font-medium ${sora.className}`}>
              You have been signed out. Please sign back in to continue.
            </p>
          </div>

          {/* Button */}
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
            <Button
              onClick={onSignIn}
              className={`relative w-full h-14 bg-[#00a651] hover:bg-[#008a43] text-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all ${bricolage.className} font-extrabold text-lg uppercase`}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign Back In
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

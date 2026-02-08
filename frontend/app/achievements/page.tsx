"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Construction, Award } from "lucide-react";

export default function Achievements() {
  return (
    <DashboardLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-0 bg-black translate-x-4 translate-y-4" />
          <div className="relative bg-gray-100 border-4 border-dashed border-black/30 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)] p-12 flex flex-col items-center justify-center">
            <Construction className="w-20 h-20 text-amber-500 mb-6" />
            <Award className="w-16 h-16 text-black/30 mb-4" />
            <h1 className="text-3xl font-extrabold text-black/80 mb-3 uppercase tracking-wide">
              Achievements
            </h1>
            <p className="text-black/60 text-center mb-8 max-w-md">
              Achievement tracking and badges are under construction. Your progress is already being tracked on the dashboard!
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-100 border-2 border-amber-600/50 text-amber-800">
              <Construction className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider">
                Under Construction
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

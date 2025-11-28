// GitHub Copilot: Redesign this Check-In page to feel like a focused, modern CTA.
// Requirements:
// - Match the Login page style (gradient + glass card).
// - Feature one primary card with a bold "Check In" title and description.
// - If using QR scanning, highlight the scan area with a subtle glow/border animation.
// - If using code entry, make a large input + prominent "Check In" button.
// - Add a small "Recent check-ins" list below in a secondary glass card.
// - Do not change the check-in logic, just the layout and Tailwind classes.

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  X,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface AttendancePageProps {
  upcomingEvents: Array<{
    id: string;
    name: string;
    category: "COMMUNITY_SERVICE" | "GBM" | "SOCIAL_AEX";
    startTime: Date;
    endTime: Date;
    location?: string;
    isActive: boolean;
  }>;
  onCheckIn: (eventId: string) => void;
}

const categoryConfig = {
  COMMUNITY_SERVICE: {
    label: "Community Service",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "🤝",
  },
  GBM: {
    label: "General Body Meeting",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "📢",
  },
  SOCIAL_AEX: {
    label: "Workshop / Social",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: "🎓",
  },
};

export function AttendancePage({
  upcomingEvents,
  onCheckIn,
}: AttendancePageProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanError, setScanError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);

  // Cleanup camera on unmount or when camera is turned off
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            // Clear the scanner instance
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch((err) => {
            console.error("Error cleaning up scanner:", err);
          });
      }

      // Stop all media tracks to ensure camera is released
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch(() => {
          // Ignore errors when stopping tracks
        });
    };
  }, []);

  // Also cleanup when camera state changes
  useEffect(() => {
    if (!isCameraActive && scannerRef.current) {
      // Ensure camera is fully stopped when state changes to inactive
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        })
        .catch(() => {});
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      setScanError("");

      // First set camera active to show the div
      setIsCameraActive(true);

      // Wait a tiny bit for the div to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();

      if (devices && devices.length > 0) {
        // Use the first camera (or back camera on mobile)
        const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;

        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Successfully scanned QR code
            stopCamera();
            if (activeEvents.length > 0) {
              onCheckIn(activeEvents[0].id);
            }
          },
          (errorMessage) => {
            // Handle scan errors silently (they happen frequently while scanning)
          }
        );
      } else {
        throw new Error("No cameras found on this device");
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setScanError(
        err?.message ||
          "Failed to start camera. Please check camera permissions."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        // Stop the scanner
        await scannerRef.current.stop();

        // Clear the scanner to release resources
        await scannerRef.current.clear();

        // Nullify the reference
        scannerRef.current = null;
      }

      // Also stop any media tracks directly to ensure camera is fully released
      const videoElement = document.querySelector("#qr-reader video");
      if (videoElement instanceof HTMLVideoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log("Camera track stopped:", track.label);
        });
        videoElement.srcObject = null;
      }
    } catch (err) {
      console.error("Error stopping camera:", err);
    } finally {
      setIsCameraActive(false);
    }
  };

  const now = new Date();
  const activeEvents = upcomingEvents.filter(
    (event) => event.isActive && event.startTime <= now && event.endTime >= now
  );

  const todayEvents = upcomingEvents.filter(
    (event) =>
      event.startTime.toDateString() === now.toDateString() &&
      event.endTime >= now
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

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
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Check In
            </h1>
          </div>
          <p className="text-white/90 text-lg">
            Scan the event QR code to check in and track your progress
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* QR Code Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 lg:p-12 border border-white/20 shadow-2xl"
          >
            <div>
              {!isCameraActive ? (
                <div className="max-w-lg mx-auto text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative mb-8"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-[#ffb81c] rounded-3xl blur-2xl"
                    />
                    <div className="relative w-40 h-40 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center shadow-2xl border border-white/30">
                      <QrCode className="w-24 h-24 text-white" />
                    </div>
                  </motion.div>

                  <h2 className="text-3xl font-bold text-white mb-3">
                    Ready to Scan
                  </h2>
                  <p className="text-white/90 text-lg mb-8">
                    Click below to open your camera and scan the event QR code
                  </p>

                  {scanError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-200 mt-0.5" />
                        <p className="text-red-100 text-sm font-medium">
                          {scanError}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startCamera}
                    className="w-full bg-white text-[#00a651] py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Open Camera to Scan
                  </motion.button>

                  {activeEvents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 p-5 bg-green-500/20 backdrop-blur-sm border-2 border-green-400/40 rounded-2xl shadow-lg"
                    >
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-green-100 font-medium">
                            Event Active Now
                          </p>
                          <p className="text-base font-semibold text-white">
                            {activeEvents[0].name}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="max-w-lg mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Scanning Active
                        </h2>
                        <p className="text-sm text-white/80">
                          Position QR code in frame
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopCamera}
                      className="px-4 py-2 text-red-100 hover:text-white bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-400/30 transition-all flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Close
                    </motion.button>
                  </div>

                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -inset-4 bg-[#ffb81c] rounded-3xl blur-xl"
                    />
                    <div
                      id="qr-reader"
                      ref={scannerElementRef}
                      className="relative rounded-2xl overflow-hidden border-4 border-white/40 shadow-2xl min-h-[350px]"
                    ></div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl">
                    <p className="text-sm text-white font-medium text-center">
                      💡 Hold your device steady and ensure good lighting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Today&apos;s Events
                </h2>
                <p className="text-white/80">Events happening today</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {todayEvents.map((event, index) => {
                  const config = categoryConfig[event.category];
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-sm text-white font-medium">
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-4">
                          {event.name}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm text-white/90">
                            <div className="w-8 h-8 bg-blue-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center border border-blue-400/30">
                              <Clock className="w-4 h-4 text-blue-200" />
                            </div>
                            <span className="font-medium">
                              {formatTime(event.startTime)} -{" "}
                              {formatTime(event.endTime)}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-3 text-sm text-white/90">
                              <div className="w-8 h-8 bg-purple-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center border border-purple-400/30">
                                <MapPin className="w-4 h-4 text-purple-200" />
                              </div>
                              <span className="font-medium">
                                {event.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  X,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00a651] to-[#008a44]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
              <QrCode className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">Check In</h1>
            <p className="text-white/90 text-lg">
              Scan the event QR code to check in
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* QR Code Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-2xl border-0 overflow-hidden">
            <div className="p-8 lg:p-12">
              {!isCameraActive ? (
                <div className="max-w-lg mx-auto text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative mb-8"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] to-[#008a44] rounded-3xl blur-2xl opacity-20"></div>
                    <div className="relative w-40 h-40 bg-gradient-to-br from-[#00a651] to-[#008a44] rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                      <QrCode className="w-24 h-24 text-white" />
                    </div>
                  </motion.div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Ready to Scan
                  </h2>
                  <p className="text-gray-600 text-lg mb-8">
                    Click below to open your camera and scan the event QR code
                  </p>

                  {scanError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <p className="text-red-700 text-sm font-medium">
                          {scanError}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    onClick={startCamera}
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#00a651] to-[#008a44] hover:from-[#008a44] hover:to-[#00a651] text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Open Camera to Scan
                  </Button>

                  {activeEvents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl"
                    >
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-green-700 font-medium">
                            Event Active Now
                          </p>
                          <p className="text-base font-semibold text-green-900">
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
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00a651] to-[#008a44] rounded-full flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Scanning Active
                        </h2>
                        <p className="text-sm text-gray-600">
                          Position QR code in frame
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stopCamera}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-br from-[#00a651]/20 to-[#008a44]/20 rounded-3xl blur-xl"></div>
                    <div
                      id="qr-reader"
                      ref={scannerElementRef}
                      className="relative rounded-2xl overflow-hidden border-4 border-[#00a651] shadow-2xl min-h-[350px]"
                    ></div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-900 font-medium text-center">
                      💡 Hold your device steady and ensure good lighting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Today's Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todayEvents.map((event, index) => {
                const config = categoryConfig[event.category];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="mb-4">
                        <Badge className={`${config.color} text-sm px-3 py-1`}>
                          {config.icon} {config.label}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-4">
                        {event.name}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">
                              {event.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

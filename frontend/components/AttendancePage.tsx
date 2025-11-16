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
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

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
        await scannerRef.current.stop();
        scannerRef.current = null;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00843D] to-[#006830] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Check In</h1>
                <p className="text-white/90 mt-1">
                  Scan QR code to check in to events
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* QR Code Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 mb-8">
            <div className="max-w-md mx-auto text-center">
              {!isCameraActive ? (
                <>
                  <div className="w-32 h-32 bg-gradient-to-br from-[#00843D] to-[#006830] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Scan QR Code
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Use your camera to scan the event's QR code
                  </p>

                  {scanError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {scanError}
                    </div>
                  )}

                  <Button
                    onClick={startCamera}
                    className="w-full mb-4 bg-[#00843D] hover:bg-[#006830]"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Open Camera to Scan
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Scanning QR Code
                    </h2>
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

                  <div
                    id="qr-reader"
                    ref={scannerElementRef}
                    className="rounded-lg overflow-hidden border-2 border-[#00843D] bg-black min-h-[300px]"
                  ></div>

                  <p className="text-sm text-gray-600 mt-4">
                    Position the QR code within the frame to scan
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    If the camera doesn't start, check your browser permissions
                  </p>
                </>
              )}

              {activeEvents.length > 0 && !isCameraActive && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      {activeEvents[0].name} is currently active
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Today's Events ({todayEvents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayEvents.map((event, index) => {
                const config = categoryConfig[event.category];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6">
                      <div className="mb-4">
                        <Badge className={config.color}>
                          {config.icon} {config.label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {event.name}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

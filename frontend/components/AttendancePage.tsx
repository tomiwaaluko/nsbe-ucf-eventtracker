// Brutalist/Geometric Design System for NSBE UCF Attendance
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
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
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
  onCheckIn: (
    eventId: string,
    qrSecret: string
  ) => Promise<{ success: boolean; message: string; event?: any }>;
}

const categoryConfig = {
  COMMUNITY_SERVICE: {
    label: "Community Service",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "",
  },
  GBM: {
    label: "General Body Meeting",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "",
  },
  SOCIAL_AEX: {
    label: "Workshop / Social",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: "",
  },
};

export function AttendancePage({
  upcomingEvents,
  onCheckIn,
}: AttendancePageProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanError, setScanError] = useState("");
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    event?: any;
  } | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomMin, setZoomMin] = useState(1);
  const [zoomMax, setZoomMax] = useState(4);
  const [supportsHardwareZoom, setSupportsHardwareZoom] = useState(false);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
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

  // Detect hardware zoom support and store the camera track after camera starts
  const initZoom = () => {
    const videoEl = document.querySelector("#qr-reader video") as HTMLVideoElement | null;
    if (!videoEl || !videoEl.srcObject) return;
    const stream = videoEl.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    cameraTrackRef.current = track;

    const capabilities = track.getCapabilities() as any;
    if (capabilities && "zoom" in capabilities) {
      setSupportsHardwareZoom(true);
      setZoomMin(capabilities.zoom.min ?? 1);
      setZoomMax(Math.min(capabilities.zoom.max ?? 4, 8));
      setZoomLevel(capabilities.zoom.min ?? 1);
    } else {
      // CSS transform fallback: zoom only the video element visually
      setSupportsHardwareZoom(false);
      setZoomMin(1);
      setZoomMax(4);
      setZoomLevel(1);
    }
  };

  const applyZoom = async (level: number) => {
    const track = cameraTrackRef.current;
    if (track) {
      const capabilities = track.getCapabilities() as any;
      if (capabilities && "zoom" in capabilities) {
        // Hardware zoom — zooms the actual camera sensor, works great on mobile
        try {
          await track.applyConstraints({ advanced: [{ zoom: level } as any] });
        } catch (e) {
          // fall through to CSS zoom
        }
        setZoomLevel(level);
        return;
      }
    }
    // CSS transform fallback — only zooms the video display, overflow is hidden by container
    const videoEl = document.querySelector("#qr-reader video") as HTMLVideoElement | null;
    if (videoEl) {
      videoEl.style.transform = `scale(${level})`;
      videoEl.style.transformOrigin = "center center";
      videoEl.style.transition = "transform 0.15s ease";
    }
    setZoomLevel(level);
  };

  const handleZoomIn = () => {
    const step = supportsHardwareZoom ? (zoomMax - zoomMin) / 8 : 0.5;
    const next = Math.min(+(zoomLevel + step).toFixed(2), zoomMax);
    applyZoom(next);
  };

  const handleZoomOut = () => {
    const step = supportsHardwareZoom ? (zoomMax - zoomMin) / 8 : 0.5;
    const next = Math.max(+(zoomLevel - step).toFixed(2), zoomMin);
    applyZoom(next);
  };

  const resetZoom = () => {
    applyZoom(zoomMin);
    cameraTrackRef.current = null;
    setSupportsHardwareZoom(false);
    setZoomLevel(1);
  };

  const startCamera = async () => {
    try {
      setScanError("");
      setCheckInResult(null);

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
          async (decodedText: string, _decodedResult: any) => {
            try {
              // Stop camera immediately
              await stopCamera();

              // Parse QR payload
              let payload;
              try {
                payload = JSON.parse(decodedText);
              } catch (parseError) {
                setScanError("Invalid QR code format. Please scan a valid event QR code.");
                setCheckInResult({
                  success: false,
                  message: "Invalid QR code format. Please scan a valid event QR code.",
                });
                return;
              }

              // Validate payload structure
              if (
                payload.type !== "event_checkin" ||
                !payload.eventId ||
                !payload.token
              ) {
                setScanError("Invalid QR code format. Expected event check-in QR code.");
                setCheckInResult({
                  success: false,
                  message: "Invalid QR code format. Expected event check-in QR code.",
                });
                return;
              }

              // Call check-in API
              setIsCheckingIn(true);
              setCheckInResult(null);

              const result = await onCheckIn(payload.eventId, payload.token);

              setCheckInResult(result);

              if (result.success) {
                // Clear error on success
                setScanError("");
                // Auto-clear success message after 5 seconds
                setTimeout(() => {
                  setCheckInResult(null);
                }, 5000);
              } else {
                setScanError(result.message);
              }
            } catch (error: any) {
              setScanError(error.message || "Failed to check in. Please try again.");
              setCheckInResult({
                success: false,
                message: error.message || "Failed to check in. Please try again.",
              });
            } finally {
              setIsCheckingIn(false);
            }
          },
          (_errorMessage: string) => {
            // Handle scan errors silently (they happen frequently while scanning)
          }
        );

        // Init zoom after camera stream is established
        setTimeout(initZoom, 500);
      } else {
        throw new Error("No cameras found on this device");
      }
    } catch (err: any) {
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
        });
        videoElement.srcObject = null;
      }
    } catch (err) {
      // Ignore errors when stopping camera
    } finally {
      resetZoom();
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
          className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-[#ed1c24] opacity-12"
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
      <div className="relative z-10 p-4 lg:p-8 space-y-6">
        {/* Header - Brutalist style matching Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1
                  className={`text-4xl lg:text-5xl font-extrabold mb-3 text-black ${bricolage.className} tracking-tight`}
                >
                  Check In
                </h1>
                <p
                  className={`text-lg ${sora.className} text-black/70 max-w-2xl`}
                >
                  Scan the event QR code to check in and track your progress
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffb81c] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Zap className="w-4 h-4 text-black" />
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${bricolage.className} text-black`}
                >
                  Quick Scan
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* QR Code Scanner - Brutalist style */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 lg:p-12">
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
                        boxShadow: [
                          "0 0 20px rgba(0, 166, 81, 0.3)",
                          "0 0 40px rgba(0, 166, 81, 0.5)",
                          "0 0 20px rgba(0, 166, 81, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mx-auto w-64 h-64 bg-black/5 flex items-center justify-center border-4 border-dashed border-black"
                    >
                      <div className="text-center">
                        <QrCode className="w-24 h-24 text-black/60 mx-auto mb-4" />
                        <p
                          className={`text-black/80 font-bold mb-2 ${bricolage.className} uppercase text-lg`}
                        >
                          Ready to Scan
                        </p>
                        <p
                          className={`text-sm ${sora.className} text-black/60 font-medium`}
                        >
                          Position QR code within frame
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>

                  <p
                    className={`text-black/70 mb-8 ${sora.className} text-lg`}
                  >
                    Click below to open your camera and scan the event QR code
                  </p>

                  {scanError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 relative"
                    >
                      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                      <div className="relative bg-[#ed1c24] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-white mt-0.5" />
                          <p
                            className={`text-white text-sm font-medium ${sora.className}`}
                          >
                            {scanError}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {checkInResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 relative"
                    >
                      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                      <div
                        className={`relative border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-4 ${
                          checkInResult.success
                            ? "bg-[#00a651]"
                            : "bg-[#ed1c24]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {checkInResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-white mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-white mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p
                              className={`text-white text-sm font-medium ${sora.className}`}
                            >
                              {checkInResult.message}
                            </p>
                            {checkInResult.success && checkInResult.event && (
                              <p
                                className={`text-white/90 text-xs mt-1 ${sora.className}`}
                              >
                                Event: {checkInResult.event.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {isCheckingIn && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-6 relative"
                    >
                      <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                      <div className="relative bg-[#ffb81c] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <p
                            className={`text-black text-sm font-medium ${sora.className}`}
                          >
                            Processing check-in...
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "8px 8px 0 0 rgba(0,0,0,1)",
                      x: 4,
                      y: 4,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startCamera}
                    style={{ fontFamily: "var(--font-bricolage)" }}
                    className="w-full bg-[#00a651] text-white py-4 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#008a44] text-lg"
                  >
                    <Camera className="w-5 h-5" />
                    Open Camera to Scan
                  </motion.button>

                  {activeEvents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 relative"
                    >
                      <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                      <div className="relative bg-[#00a651] border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-5">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <p
                              className={`text-sm text-white/90 font-medium ${sora.className}`}
                            >
                              Event Active Now
                            </p>
                            <p
                              className={`text-base font-semibold text-white ${bricolage.className}`}
                            >
                              {activeEvents[0].name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="max-w-lg mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black/5 border-2 border-black rounded-full flex items-center justify-center">
                        <Camera className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h2
                          className={`text-xl font-bold text-black ${bricolage.className}`}
                        >
                          Scanning Active
                        </h2>
                        <p
                          className={`text-sm text-black/70 ${sora.className}`}
                        >
                          Position QR code in frame
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopCamera}
                      className="px-4 py-2 bg-[#ed1c24] text-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all flex items-center gap-1 font-bold uppercase text-sm hover:bg-[#c91a1f]"
                      style={{ fontFamily: "var(--font-bricolage)" }}
                    >
                      <X className="w-4 h-4" />
                      Close
                    </motion.button>
                  </div>

                  <div className="relative">
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(0, 166, 81, 0.3)",
                          "0 0 40px rgba(0, 166, 81, 0.5)",
                          "0 0 20px rgba(0, 166, 81, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -inset-4 border-4 border-dashed border-black bg-black/5"
                    />
                    <div
                      id="qr-reader"
                      ref={scannerElementRef}
                      className="relative overflow-hidden border-4 border-black min-h-[350px] bg-black/5"
                    ></div>
                  </div>

                  {/* Zoom controls */}
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= zoomMin}
                      aria-label="Zoom out"
                      className="w-11 h-11 flex items-center justify-center border-2 border-black bg-white font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      <ZoomOut className="w-5 h-5 text-black" />
                    </button>
                    <div className="flex flex-col items-center min-w-[56px]">
                      <span className={`text-black font-extrabold text-lg leading-none ${bricolage.className}`}>
                        {supportsHardwareZoom
                          ? `${zoomLevel.toFixed(1)}x`
                          : `${zoomLevel.toFixed(1)}x`}
                      </span>
                      <span className={`text-black/50 text-[10px] uppercase font-bold tracking-wide mt-0.5 ${bricolage.className}`}>
                        {supportsHardwareZoom ? "optical" : "digital"}
                      </span>
                    </div>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= zoomMax}
                      aria-label="Zoom in"
                      className="w-11 h-11 flex items-center justify-center border-2 border-black bg-white font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      <ZoomIn className="w-5 h-5 text-black" />
                    </button>
                  </div>

                  <div className="mt-4 relative">
                    <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
                    <div className="relative bg-[#ffb81c] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-4">
                      <p
                        className={`text-sm text-black font-medium text-center ${sora.className}`}
                      >
                        💡 Hold your device steady and ensure good lighting
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Today's Events - Brutalist style */}
        {todayEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="space-y-6 max-w-7xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <h2
                className={`text-2xl font-bold text-white ${bricolage.className}`}
              >
                Today&apos;s Events
              </h2>
              <div className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium border border-blue-400/30">
                {todayEvents.length}
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todayEvents.map((event, index) => {
                const config = categoryConfig[event.category];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30, rotate: -1 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{
                      delay: 0.6 + index * 0.1,
                      duration: 0.6,
                    }}
                    whileHover={{
                      rotate: 1,
                      scale: 1.02,
                      x: 4,
                      y: -4,
                      transition: { duration: 0.2 },
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
                    <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 border-2 border-black text-sm font-medium">
                          {config.icon && <span>{config.icon}</span>}
                          <span
                            className={`text-black ${bricolage.className} font-bold uppercase text-xs`}
                          >
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <h3
                        className={`font-bold text-lg text-black mb-4 ${bricolage.className}`}
                      >
                        {event.name}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-black/80">
                          <div className="w-8 h-8 bg-black/5 border-2 border-black flex items-center justify-center">
                            <Clock className="w-4 h-4 text-black" />
                          </div>
                          <span
                            className={`font-medium ${sora.className}`}
                          >
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-3 text-sm text-black/80">
                            <div className="w-8 h-8 bg-black/5 border-2 border-black flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-black" />
                            </div>
                            <span
                              className={`font-medium ${sora.className}`}
                            >
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
  );
}

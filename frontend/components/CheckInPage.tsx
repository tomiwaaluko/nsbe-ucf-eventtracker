"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import confetti from "canvas-confetti";

console.log("🟢 [CHECKINPAGE] CheckInPage module loaded");
import {
  QrCode,
  Check,
  X,
  Camera,
  Loader2,
  Zap,
  CheckCircle2,
  CameraOff,
  AlertCircle,
  Flashlight,
  RotateCcw,
} from "lucide-react";
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

interface Event {
  id: string;
  name: string;
  startTime: string | Date;
  endTime: string | Date;
  location?: string;
}

interface CheckInPageProps {
  onCheckIn: (
    eventId: string,
    qrSecret: string
  ) => Promise<{ success: boolean; message: string; event?: any }>;
  upcomingEvents?: Event[];
}

export function CheckInPage({ onCheckIn, upcomingEvents = [] }: CheckInPageProps) {
  console.log("🎬 [COMPONENT] CheckInPage component rendered");
  
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    event?: any;
  } | null>(null);

  // Manual entry states
  const [selectedEventId, setSelectedEventId] = useState("");

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-reader";
  
  console.log("🎬 [COMPONENT] Initial state - scanMode:", scanMode, "isScanning:", isScanning);

  useEffect(() => {
    console.log("🔄 [EFFECT] useEffect triggered, scanMode:", scanMode, "isScanning:", isScanning);
    console.log("🔄 [EFFECT] Component mounted, starting camera if needed");
    
    if (scanMode === "camera" && !isScanning) {
      console.log("🔄 [EFFECT] Conditions met - starting camera scan...");
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        console.log("🔄 [EFFECT] Timer fired, calling startScanning");
        startScanning();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        console.log("🔄 [EFFECT] Cleanup: clearing timer and stopping scanner");
        stopScanning();
      };
    }

    return () => {
      console.log("🔄 [EFFECT] Cleanup: stopping scanner");
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanMode]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const startScanning = async () => {
    console.log("📷 [CAMERA] ========== STARTING CAMERA ==========");
    console.log("📷 [CAMERA] Starting camera scanning...");
    console.log("📷 [CAMERA] scannerDivId:", scannerDivId);
    
    // Wait a bit for the DOM to be ready
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Check if scanner div exists
    const scannerDiv = document.getElementById(scannerDivId);
    console.log("📷 [CAMERA] Scanner div exists:", !!scannerDiv);
    if (!scannerDiv) {
      console.error("❌ [CAMERA] Scanner div not found! Waiting and retrying...");
      // Wait a bit more and try again
      await new Promise((resolve) => setTimeout(resolve, 200));
      const retryDiv = document.getElementById(scannerDivId);
      if (!retryDiv) {
        console.error("❌ [CAMERA] Scanner div still not found after retry!");
        return;
      }
      console.log("✅ [CAMERA] Scanner div found on retry");
    } else {
      console.log("📷 [CAMERA] Scanner div visible:", scannerDiv.offsetWidth > 0 && scannerDiv.offsetHeight > 0);
      console.log("📷 [CAMERA] Scanner div dimensions:", scannerDiv.offsetWidth, "x", scannerDiv.offsetHeight);
      console.log("📷 [CAMERA] Scanner div display:", window.getComputedStyle(scannerDiv).display);
      console.log("📷 [CAMERA] Scanner div visibility:", window.getComputedStyle(scannerDiv).visibility);
    }
    
    try {
      if (html5QrCodeRef.current) {
        console.log("📷 [CAMERA] Stopping existing scanner instance...");
        await stopScanning();
      }

      console.log("📷 [CAMERA] Creating new Html5Qrcode instance...");
      html5QrCodeRef.current = new Html5Qrcode(scannerDivId);
      console.log("📷 [CAMERA] Html5Qrcode instance created:", !!html5QrCodeRef.current);

      console.log("📷 [CAMERA] Starting camera with facingMode: environment");
      console.log("📷 [CAMERA] onScanSuccess callback:", typeof onScanSuccess);
      console.log("📷 [CAMERA] onScanFailure callback:", typeof onScanFailure);
      
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText: string, decodedResult: any) => {
          console.log("🔍 [QR SCAN] ========== CALLBACK FIRED ==========");
          console.log("🔍 [QR SCAN] Callback fired! decodedText:", decodedText);
          console.log("🔍 [QR SCAN] decodedResult:", decodedResult);
          onScanSuccess(decodedText, decodedResult);
        },
        (errorMessage: string) => {
          // Only log occasionally to avoid spam
          if (Math.random() < 0.01) {
            console.log("🔍 [QR SCAN] Scan failure callback:", errorMessage);
          }
          onScanFailure(errorMessage);
        }
      );

      console.log("✅ [CAMERA] Camera started successfully - await start() completed");
      setIsScanning(true);
      setCameraPermissionDenied(false);
      console.log("✅ [CAMERA] isScanning set to true");
    } catch (error: any) {
      console.error("❌ [CAMERA] Failed to start scanning:", error);
      console.error("❌ [CAMERA] Error name:", error.name);
      console.error("❌ [CAMERA] Error message:", error.message);
      console.error("❌ [CAMERA] Error stack:", error.stack);
      if (
        error.name === "NotAllowedError" ||
        error.message?.includes("Permission denied")
      ) {
        console.error("❌ [CAMERA] Camera permission denied");
        setCameraPermissionDenied(true);
        setScanMode("manual");
      }
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    console.log("🛑 [CAMERA] stopScanning called");
    console.log("🛑 [CAMERA] html5QrCodeRef.current exists:", !!html5QrCodeRef.current);
    console.log("🛑 [CAMERA] isScanning:", isScanning);
    try {
      if (html5QrCodeRef.current) {
        console.log("🛑 [CAMERA] Stopping scanner...");
        await html5QrCodeRef.current.stop();
        console.log("🛑 [CAMERA] Scanner stopped successfully");
        html5QrCodeRef.current = null;
      } else {
        console.log("🛑 [CAMERA] No scanner instance to stop");
      }
      setIsScanning(false);
      console.log("🛑 [CAMERA] isScanning set to false");
    } catch (error: any) {
      console.error("❌ [CAMERA] Failed to stop scanning:", error);
      console.error("❌ [CAMERA] Error name:", error.name);
      console.error("❌ [CAMERA] Error message:", error.message);
      setIsScanning(false);
    }
  };

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    console.log("🔍 [QR SCAN] ========== QR CODE DETECTED ==========");
    console.log("🔍 [QR SCAN] QR code scanned successfully!");
    console.log("🔍 [QR SCAN] Raw decoded text:", decodedText);
    console.log("🔍 [QR SCAN] Decoded result object:", decodedResult);
    console.log("🔍 [QR SCAN] Type of decodedText:", typeof decodedText);
    console.log("🔍 [QR SCAN] Length of decodedText:", decodedText?.length);
    
    try {
      // Stop scanning immediately to prevent multiple scans
      console.log("🔍 [QR SCAN] Stopping camera before processing...");
      await stopScanning();
      console.log("🔍 [QR SCAN] Camera stopped successfully");

      setLoading(true);
      setResult(null);

      // Parse QR payload
      console.log("🔍 [QR SCAN] Attempting to parse QR payload...");
      let payload;
      try {
        payload = JSON.parse(decodedText);
        console.log("🔍 [QR SCAN] Parsed payload:", payload);
      } catch (parseError) {
        console.error("🔍 [QR SCAN] JSON parse error:", parseError);
        console.error("🔍 [QR SCAN] Decoded text that failed to parse:", decodedText);
        throw new Error("Invalid QR code format - not valid JSON");
      }

      console.log("🔍 [QR SCAN] Validating payload structure...");
      console.log("🔍 [QR SCAN] payload.type:", payload.type);
      console.log("🔍 [QR SCAN] payload.eventId:", payload.eventId);
      console.log("🔍 [QR SCAN] payload.token:", payload.token ? "***" : undefined);

      if (
        payload.type !== "event_checkin" ||
        !payload.eventId ||
        !payload.token
      ) {
        console.error("🔍 [QR SCAN] Invalid QR code format - missing required fields");
        console.error("🔍 [QR SCAN] Expected: { type: 'event_checkin', eventId: string, token: string }");
        throw new Error("Invalid QR code format");
      }

      console.log("🔍 [QR SCAN] Payload validation passed, calling check-in API...");
      console.log("🔍 [QR SCAN] eventId:", payload.eventId);
      console.log("🔍 [QR SCAN] qrSecret (token):", payload.token ? "***" : undefined);

      // Call check-in API
      const response = await onCheckIn(payload.eventId, payload.token);
      console.log("🔍 [QR SCAN] Check-in API response:", response);
      
      setResult(response);

      if (response.success) {
        console.log("✅ [QR SCAN] Check-in successful!");
        triggerConfetti();

        // Auto-dismiss success message and restart scanning after 5 seconds
        setTimeout(() => {
          setResult(null);
          if (scanMode === "camera") {
            console.log("🔍 [QR SCAN] Restarting camera for next scan...");
            startScanning();
          }
        }, 5000);
      } else {
        console.error("❌ [QR SCAN] Check-in failed:", response.message);
        // On failure, restart scanning after 3 seconds
        setTimeout(() => {
          setResult(null);
          if (scanMode === "camera") {
            console.log("🔍 [QR SCAN] Restarting camera after failure...");
            startScanning();
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error("❌ [QR SCAN] Error during check-in process:", error);
      console.error("❌ [QR SCAN] Error name:", error.name);
      console.error("❌ [QR SCAN] Error message:", error.message);
      console.error("❌ [QR SCAN] Error stack:", error.stack);
      
      setResult({
        success: false,
        message:
          error.message === "Invalid QR code format"
            ? "Invalid QR code. Please scan an NSBE event QR code."
            : error.message || "Failed to check in. Please try again.",
      });

      // Restart scanning after error
      setTimeout(() => {
        setResult(null);
        if (scanMode === "camera") {
          console.log("🔍 [QR SCAN] Restarting camera after error...");
          startScanning();
        }
      }, 3000);
    } finally {
      setLoading(false);
      console.log("🔍 [QR SCAN] Loading state set to false");
    }
  };

  const onScanFailure = (error: string) => {
    // Ignore continuous scan failures (normal during scanning)
    // Only log if it's not a "No MultiFormat Readers" error
    if (!error.includes("NotFoundException") && !error.includes("No QR code")) {
      // Only log occasionally to avoid spam
      if (Math.random() < 0.01) { // Log 1% of scan attempts
        console.debug("🔍 [QR SCAN] Scan attempt (normal):", error);
      }
    } else {
      console.log("🔍 [QR SCAN] Scan failure (expected):", error);
    }
  };

  const handleManualCheckIn = async () => {
    if (!selectedEventId) return;

    setLoading(true);
    setResult(null);

    try {
      // For manual entry, we need to get the event's QR secret from somewhere
      // In a real implementation, this would require the admin to share the code
      // For now, we'll show a message that manual entry requires the event code
      setResult({
        success: false,
        message:
          "Manual check-in requires the event code from the organizer. Please scan the QR code or ask an admin for the event code.",
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to check in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchToManualMode = async () => {
    await stopScanning();
    setScanMode("manual");
  };

  const switchToCameraMode = () => {
    setResult(null);
    setScanMode("camera");
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#00a651] via-[#006830] to-[#0a0a0a]" />
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
        {/* Header */}
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
                  Event Check-In
                </h1>
                <p
                  className={`text-lg ${sora.className} text-black/70 max-w-2xl`}
                >
                  Scan the QR code at the event to check in and track your
                  progress
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

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex justify-center gap-3"
        >
          <button
            onClick={switchToCameraMode}
            disabled={cameraPermissionDenied}
            className={`px-6 py-3 border-4 border-black font-bold uppercase tracking-wider transition-all ${
              scanMode === "camera"
                ? "bg-[#00a651] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                : "bg-white text-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            } ${cameraPermissionDenied ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Camera className="w-4 h-4 inline mr-2" />
            Camera Scan
          </button>
          <button
            onClick={switchToManualMode}
            className={`px-6 py-3 border-4 border-black font-bold uppercase tracking-wider transition-all ${
              scanMode === "manual"
                ? "bg-[#00a651] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                : "bg-white text-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            }`}
          >
            <QrCode className="w-4 h-4 inline mr-2" />
            Manual Entry
          </button>
        </motion.div>

        {/* Main Check-In Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {scanMode === "camera" ? (
                <>
                  {/* QR Scanner Area */}
                  <div className="text-center mb-6">
                    {cameraPermissionDenied ? (
                      <div className="mx-auto w-full max-w-md bg-red-50 border-4 border-black p-6">
                        <CameraOff className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <p
                          className={`text-black font-bold mb-2 ${bricolage.className} uppercase text-lg`}
                        >
                          Camera Access Denied
                        </p>
                        <p
                          className={`text-sm ${sora.className} text-black/70 mb-4`}
                        >
                          Please enable camera permissions in your browser
                          settings to use QR scanning.
                        </p>
                        <button
                          onClick={switchToManualMode}
                          className="px-4 py-2 bg-[#00a651] text-white border-2 border-black font-bold uppercase"
                        >
                          Use Manual Entry Instead
                        </button>
                      </div>
                    ) : (
                      <div className="mx-auto w-full max-w-md">
                        <div
                          id={scannerDivId}
                          className="border-4 border-dashed border-black rounded-lg overflow-hidden"
                        />
                        {isScanning && !loading && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`mt-4 text-black/80 font-bold ${bricolage.className} uppercase text-sm`}
                          >
                            Scanning for QR code...
                          </motion.p>
                        )}
                        {loading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 flex items-center justify-center gap-2 text-black"
                          >
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span
                              className={`font-bold ${bricolage.className} uppercase`}
                            >
                              Processing...
                            </span>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Manual Entry Section */}
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p
                        className={`text-black/70 ${sora.className} text-sm`}
                      >
                        Select an upcoming event to check in
                      </p>
                    </div>

                    {upcomingEvents && upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingEvents.slice(0, 5).map((event) => (
                          <motion.button
                            key={event.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedEventId(event.id)}
                            className={`w-full p-4 border-3 border-black text-left transition-all ${
                              selectedEventId === event.id
                                ? "bg-[#00a651] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                                : "bg-black/5 hover:bg-black/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p
                                  className={`font-bold ${bricolage.className} mb-1`}
                                >
                                  {event.name}
                                </p>
                                <p
                                  className={`text-sm ${sora.className} opacity-80`}
                                >
                                  {formatDate(event.startTime)} •{" "}
                                  {formatTime(event.startTime)}
                                </p>
                                {event.location && (
                                  <p
                                    className={`text-xs ${sora.className} opacity-70 mt-1`}
                                  >
                                    {event.location}
                                  </p>
                                )}
                              </div>
                              {selectedEventId === event.id && (
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-black/5 border-2 border-dashed border-black">
                        <AlertCircle className="w-12 h-12 text-black/40 mx-auto mb-3" />
                        <p
                          className={`text-black/60 ${sora.className} text-sm`}
                        >
                          No upcoming events available
                        </p>
                      </div>
                    )}

                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "8px 8px 0 0 rgba(0,0,0,1)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleManualCheckIn}
                      disabled={!selectedEventId || loading}
                      className="w-full bg-[#00a651] text-white py-4 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#008a44] text-lg mt-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Checking in...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Check In to Selected Event
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
              <div
                className={`relative border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 ${
                  result.success ? "bg-[#00a651]" : "bg-[#ed1c24]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {result.success ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2,
                      }}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30"
                    >
                      <Check className="w-7 h-7 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                      transition={{
                        scale: { type: "spring", stiffness: 200, delay: 0.2 },
                        rotate: { duration: 0.5, delay: 0.3 },
                      }}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30"
                    >
                      <X className="w-7 h-7 text-white" />
                    </motion.div>
                  )}
                  <div className="flex-1">
                    <h4
                      className={`text-white text-xl font-bold mb-1 ${bricolage.className}`}
                    >
                      {result.success
                        ? "Check-in Successful!"
                        : "Check-in Failed"}
                    </h4>
                    <p className={`text-white/90 text-sm ${sora.className}`}>
                      {result.message}
                    </p>
                    {result.event && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className={`text-sm text-white/90 ${sora.className}`}>
                          Event:{" "}
                          <strong className="text-white">
                            {result.event.name}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
            <h4
              className={`text-black text-lg font-extrabold mb-4 uppercase ${bricolage.className} tracking-wide`}
            >
              How to Check In
            </h4>
            <ol className="space-y-4">
              {[
                "Attend an NSBE event and locate the check-in QR code",
                "Tap 'Camera Scan' and point your camera at the QR code",
                "Your attendance will be recorded automatically",
                "Track your progress towards 1-1-1 or 3-3-3 achievements",
              ].map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex gap-3"
                >
                  <div className="w-6 h-6 border-2 border-black bg-[#00a651] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p
                    className={`text-sm ${sora.className} text-black/80 pt-0.5 font-medium`}
                  >
                    {step}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

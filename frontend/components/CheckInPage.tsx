// Brutalist/Geometric Design System for NSBE UCF Check-In
import { useState } from "react";
import {
  QrCode,
  Check,
  X,
  Camera,
  Loader2,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
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

interface CheckInPageProps {
  onCheckIn: (
    eventId: string,
    qrSecret: string
  ) => Promise<{ success: boolean; message: string; event?: any }>;
}

export function CheckInPage({ onCheckIn }: CheckInPageProps) {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    event?: any;
  } | null>(null);

  const handleCheckIn = async () => {
    if (!qrCode.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // In production, this would scan a QR code
      // For now, we'll simulate it with a code input
      const response = await onCheckIn("event-id", qrCode);
      setResult(response);

      if (response.success) {
        setQrCode("");
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to check in. Please try again.",
      });
    } finally {
      setLoading(false);
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

      {/* Brutalist background */}
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
          className="text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <h2
              className={`text-4xl lg:text-5xl font-extrabold text-white ${bricolage.className} tracking-tight`}
            >
              Event Check-In
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffb81c] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <Zap className="w-4 h-4 text-black" />
              <span
                className={`text-sm font-bold uppercase tracking-wider ${bricolage.className} text-black`}
              >
                Quick Scan
              </span>
            </div>
          </div>
          <p
            className={`text-white/90 ${sora.className} text-lg`}
          >
            Scan the QR code at the event to check in and track your progress
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Check-In Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md space-y-6">
                {/* QR Scanner Area with Glow Animation */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255, 184, 28, 0.3)",
                      "0 0 40px rgba(255, 184, 28, 0.5)",
                      "0 0 20px rgba(255, 184, 28, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="aspect-square bg-black/5 flex items-center justify-center border-4 border-dashed border-black"
                >
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-black/60 mx-auto mb-4" />
                    <p
                      className={`text-black/80 font-bold mb-2 ${bricolage.className} uppercase`}
                    >
                      QR Code Scanner
                    </p>
                    <p
                      className={`text-sm ${sora.className} text-black/60 font-medium`}
                    >
                      Position QR code within frame
                    </p>
                  </div>
                </motion.div>

                {/* Manual Entry Section */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-white/70 text-sm">
                      <div className="h-px w-12 bg-white/20"></div>
                      <span>Or enter event code</span>
                      <div className="h-px w-12 bg-white/20"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-bold uppercase tracking-wide ${bricolage.className} text-black`}
                    >
                      Event Code
                    </label>
                    <div className="relative group">
                      <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/50 transition-colors group-hover:text-black/70" />
                      <input
                        type="text"
                        placeholder="Enter event code..."
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleCheckIn();
                          }
                        }}
                        disabled={loading}
                        style={{ fontFamily: "var(--font-sora)" }}
                        className="w-full pl-12 pr-4 py-3.5 bg-black/5 border-2 border-black focus:border-[#00a651] focus:ring-0 text-black placeholder:text-black/40 focus:outline-none transition-all duration-300 hover:bg-black/10 font-medium"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "8px 8px 0 0 rgba(0,0,0,1)",
                      x: 4,
                      y: 4,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckIn}
                    disabled={!qrCode.trim() || loading}
                    style={{ fontFamily: "var(--font-bricolage)" }}
                    className="w-full bg-[#00a651] text-white py-3.5 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#008a44]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Checking in...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Check In Now
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>

          {/* Right Column - Result and Info */}
          <div className="space-y-6">
            {/* Result Card */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`relative ${
                  result.success ? "bg-[#00a651]" : "bg-[#ed1c24]"
                }`}
              >
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                <div className="relative border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
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
                      className="p-3 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30"
                    >
                      <Check className="w-7 h-7 text-green-100" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2,
                      }}
                      className="p-3 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-400/30"
                    >
                      <X className="w-7 h-7 text-red-100" />
                    </motion.div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-white text-xl font-bold mb-1">
                      {result.success
                        ? "Check-in Successful!"
                        : "Check-in Failed"}
                    </h4>
                    <p className="text-white/80 text-sm">{result.message}</p>
                    {result.event && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm text-white/90">
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

            {/* Instructions Card */}
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
                  "Attend an NSBE event and locate the check-in station",
                  "Scan the QR code displayed at the event using the scanner above",
                  "Alternatively, enter the event code provided by the organizer",
                  "Your attendance will be recorded and count towards your 1-1-1 or 3-3-3 progress",
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

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />
              <div className="relative bg-[#ffb81c] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6">
                <h5
                  className={`text-black text-lg font-extrabold mb-3 flex items-center gap-2 uppercase ${bricolage.className} tracking-wide`}
                >
                  <span>💡</span> Tips
                </h5>
              <ul className="space-y-2 text-sm text-white/80">
                {[
                  "Make sure you're at the event location before checking in",
                  "Check-in is only available during the event time",
                  "If you have issues, ask an event organizer for help",
                  "You can only check in once per event",
                ].map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-black/70 mt-0.5 font-bold">•</span>
                    <span
                      className={`${sora.className} text-black/80 font-medium`}
                    >
                      {tip}
                    </span>
                  </motion.li>
                ))}
              </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

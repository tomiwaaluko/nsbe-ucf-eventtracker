import { useState } from "react";
import {
  QrCode,
  Check,
  X,
  Camera,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

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
          className="text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <h2 className="text-3xl font-bold text-white">Event Check-In</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-[#ffb81c]" />
              <span className="text-sm font-medium text-white">Quick Scan</span>
            </div>
          </div>
          <p className="text-white/80">
            Scan the QR code at the event to check in and track your progress
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Check-In Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
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
                  className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center border-4 border-dashed border-white/30"
                >
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-white/60 mx-auto mb-4" />
                    <p className="text-white/80 font-medium mb-2">
                      QR Code Scanner
                    </p>
                    <p className="text-sm text-white/60">
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
                    <label className="block text-sm font-medium text-white">
                      Event Code
                    </label>
                    <div className="relative group">
                      <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 transition-colors group-hover:text-white/70" />
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
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 focus:border-white/40 focus:ring-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-4 transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:scale-[1.02]"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckIn}
                    disabled={!qrCode.trim() || loading}
                    className="w-full bg-white text-[#00a651] py-3.5 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </motion.div>

          {/* Right Column - Result and Info */}
          <div className="space-y-6">
            {/* Result Card */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 shadow-2xl ${
                  result.success
                    ? "border-green-400/50 bg-green-500/10"
                    : "border-red-400/50 bg-red-500/10"
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
              </motion.div>
            )}

            {/* Instructions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
            >
              <h4 className="text-white text-lg font-bold mb-4">
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
                    <div className="w-6 h-6 rounded-full bg-[#00a651] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/80 pt-0.5">{step}</p>
                  </motion.li>
                ))}
              </ol>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/30 shadow-2xl"
            >
              <h5 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
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
                    <span className="text-blue-300 mt-0.5">•</span>
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

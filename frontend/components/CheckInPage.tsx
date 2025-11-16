import { useState } from "react";
import { QrCode, Check, X, Camera, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Event Check-In</h2>
        <p className="text-gray-600 mt-1">
          Scan the QR code at the event to check in
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-md border border-gray-200"
        >
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md">
              {/* Simulated QR Scanner */}
              <div className="aspect-square bg-gray-100 rounded-xl mb-6 flex items-center justify-center border-4 border-dashed border-gray-300">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">QR Code Scanner</p>
                  <p className="text-sm text-gray-400">
                    Position QR code within frame
                  </p>
                </div>
              </div>

              {/* Manual entry */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Or enter event code manually
                  </label>
                  <Input
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
                  />
                </div>

                <Button
                  onClick={handleCheckIn}
                  disabled={!qrCode.trim() || loading}
                  className="w-full bg-[#00a651] hover:bg-[#008a44] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking in...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Check In
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Result and Instructions */}
        <div className="space-y-6">
          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl p-6 border-2 ${
                result.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-100 rounded-full">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h4
                    className={
                      result.success ? "text-green-900" : "text-red-900"
                    }
                  >
                    {result.success
                      ? "Check-in Successful!"
                      : "Check-in Failed"}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      result.success ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.event && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-green-700">
                        Event: <strong>{result.event.name}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
          >
            <h4 className="text-gray-900 mb-4">How to Check In</h4>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                  1
                </Badge>
                <p className="text-sm text-gray-600">
                  Attend an NSBE event and locate the check-in station
                </p>
              </li>
              <li className="flex gap-3">
                <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                  2
                </Badge>
                <p className="text-sm text-gray-600">
                  Scan the QR code displayed at the event using the scanner
                  above
                </p>
              </li>
              <li className="flex gap-3">
                <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                  3
                </Badge>
                <p className="text-sm text-gray-600">
                  Alternatively, enter the event code provided by the organizer
                </p>
              </li>
              <li className="flex gap-3">
                <Badge className="bg-[#00a651] text-white shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0">
                  4
                </Badge>
                <p className="text-sm text-gray-600">
                  Your attendance will be recorded and count towards your 1-1-1
                  or 3-3-3 progress
                </p>
              </li>
            </ol>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 rounded-xl p-6 border border-blue-200"
          >
            <h5 className="text-blue-900 mb-2">💡 Tips</h5>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • Make sure you're at the event location before checking in
              </li>
              <li>• Check-in is only available during the event time</li>
              <li>• If you have issues, ask an event organizer for help</li>
              <li>• You can only check in once per event</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

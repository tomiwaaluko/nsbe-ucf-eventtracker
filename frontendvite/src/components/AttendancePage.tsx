import { useState } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
  const [qrCode, setQrCode] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"qr" | "manual">("qr");

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

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.trim() && activeEvents.length > 0) {
      onCheckIn(activeEvents[0].id);
      setQrCode("");
    }
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
                  Scan QR code or select an event to check in
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Check-in Method Selector */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={selectedMethod === "qr" ? "default" : "outline"}
            onClick={() => setSelectedMethod("qr")}
            className={
              selectedMethod === "qr" ? "bg-[#00843D] hover:bg-[#006830]" : ""
            }
          >
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
          <Button
            variant={selectedMethod === "manual" ? "default" : "outline"}
            onClick={() => setSelectedMethod("manual")}
            className={
              selectedMethod === "manual"
                ? "bg-[#00843D] hover:bg-[#006830]"
                : ""
            }
          >
            <Calendar className="w-4 h-4 mr-2" />
            Manual Selection
          </Button>
        </div>

        {/* QR Code Scanner */}
        {selectedMethod === "qr" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 mb-8">
              <div className="max-w-md mx-auto text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#00843D] to-[#006830] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Scan QR Code
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter the code from the event's QR code or use your camera to
                  scan
                </p>
                <form onSubmit={handleQRSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter QR code"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    className="text-center text-lg"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-[#00843D] hover:bg-[#006830]"
                    disabled={!qrCode.trim()}
                  >
                    Submit Check-In
                  </Button>
                </form>

                {activeEvents.length > 0 && (
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
        )}

        {/* Manual Selection */}
        {selectedMethod === "manual" && (
          <div className="space-y-8">
            {/* Active Events */}
            {activeEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Active Events ({activeEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeEvents.map((event, index) => {
                    const config = categoryConfig[event.category];
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <Badge className={config.color}>
                                {config.icon} {config.label}
                              </Badge>
                              <Badge className="ml-2 bg-green-500 text-white">
                                Active Now
                              </Badge>
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-3">
                            {event.name}
                          </h3>
                          <div className="space-y-2 mb-4">
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
                          <Button
                            onClick={() => onCheckIn(event.id)}
                            className="w-full bg-[#00843D] hover:bg-[#006830]"
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Check In Now
                          </Button>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Today's Upcoming Events */}
            {todayEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Today's Events ({todayEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayEvents.map((event, index) => {
                    const config = categoryConfig[event.category];
                    const isPast = event.endTime < now;
                    const isActive =
                      event.startTime <= now && event.endTime >= now;

                    if (isActive || isPast) return null;

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
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                Starts at {formatTime(event.startTime)}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" disabled className="w-full">
                            Check-in opens at {formatTime(event.startTime)}
                          </Button>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Active Events */}
            {activeEvents.length === 0 && todayEvents.length === 0 && (
              <Card className="p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Active Events
                  </h3>
                  <p className="text-gray-600 mb-6">
                    There are no events available for check-in right now.
                  </p>
                  <p className="text-sm text-gray-500">
                    Check back when an event starts or use the QR code scanner
                    if you're at an event.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

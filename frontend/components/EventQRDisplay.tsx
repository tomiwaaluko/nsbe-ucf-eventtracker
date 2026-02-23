"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Maximize2,
  Copy,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { EventCategory } from "@/lib/constants/event-categories";

interface Event {
  id: string;
  name: string;
  description?: string;
  category: EventCategory;
  startTime: Date | string;
  endTime: Date | string;
  location?: string;
  isActive: boolean;
  checkInCode?: string;
}

interface EventQRDisplayProps {
  event: Event;
  token: string;
  onClose?: () => void;
}

export function EventQRDisplay({
  event,
  token,
  onClose,
}: EventQRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadQRCode();
  }, [event.id, token]);

  const loadQRCode = async () => {
    try {
      setIsLoading(true);
      console.log("Loading QR code for event:", event.id);
      const result = await api.getEventQR(token, event.id, "dataurl", 512);
      console.log("QR code API response:", result);
      
      // Handle response - check if it's already a dataUrl string or an object
      if (typeof result === 'string') {
        console.log("QR code is string format, length:", result.length);
        setQrDataUrl(result);
      } else if (result && typeof result === 'object' && 'dataUrl' in result) {
        console.log("QR code is object format, dataUrl length:", result.dataUrl?.length);
        if (typeof result.dataUrl === 'string' && result.dataUrl.startsWith('data:image')) {
          setQrDataUrl(result.dataUrl);
        } else {
          throw new Error('Invalid QR code dataUrl format');
        }
      } else {
        console.error("Unexpected QR code response format:", result);
        throw new Error('Invalid QR code response format');
      }
    } catch (error: any) {
      console.error("Failed to load QR code:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
      });
      const errorMessage = error?.message || "Failed to load QR code";
      toast.error(errorMessage);
      // Set empty string to prevent broken image display
      setQrDataUrl("");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = async (format: "png" | "svg") => {
    try {
      const size = format === "png" ? 1024 : 512;
      const blob = await api.getEventQR(token, event.id, format, size);
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.name.replace(/\s+/g, "-")}-qr.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Failed to download ${format}:`, error);
      toast.error(`Failed to download ${format.toUpperCase()}`);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrDataUrl);
      toast.success("QR code data URL copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="flex flex-col items-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-2 text-center text-black">{event.name}</h1>
          <p className="text-gray-500 text-center mb-4">Scan the QR code in the app in the check-in section</p>
          <div className="text-lg text-gray-600 mb-8 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(event.startTime)}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="w-96 h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Event QR Code"
              className="w-96 h-96 rounded-lg shadow-2xl"
              onError={(e) => {
                console.error("Failed to load QR code image");
                toast.error("Failed to display QR code image");
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-96 h-96 bg-red-50 rounded-lg flex flex-col items-center justify-center border-2 border-red-200">
              <QrCode className="w-16 h-16 text-red-400 mb-2" />
              <p className="text-red-600 text-sm">Failed to load QR code</p>
            </div>
          )}

          {event.checkInCode && (
            <div className="mt-8 bg-[#00a651] text-white rounded-xl p-6 shadow-lg">
              <p className="text-lg mb-2 opacity-90 text-center">Or use Check-In Code:</p>
              <p className="text-5xl font-bold tracking-widest text-center font-mono">
                {event.checkInCode}
              </p>
            </div>
          )}

          <p className="mt-8 text-gray-600 text-center max-w-md">
            Scan the QR code or enter the check-in code in the app
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-black">Event QR Code</h2>
          <p className="text-gray-600">{event.name}</p>
          <p className="text-sm text-gray-500 mt-1">Scan the QR code in the app in the check-in section</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="w-full aspect-square bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          ) : qrDataUrl ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={qrDataUrl}
                alt="Event QR Code"
                className="w-full rounded-lg shadow-md border-2 border-gray-200"
                onError={(e) => {
                  console.error("Failed to load QR code image");
                  toast.error("Failed to display QR code image");
                  e.currentTarget.style.display = "none";
                }}
              />
            </motion.div>
          ) : (
            <div className="w-full aspect-square bg-red-50 rounded-lg flex flex-col items-center justify-center border-2 border-red-200">
              <QrCode className="w-16 h-16 text-red-400 mb-2" />
              <p className="text-red-600 text-sm text-center px-4">Failed to load QR code</p>
            </div>
          )}
        </div>

        {/* Event Info & Actions */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Event Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {event.checkInCode && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Check-In Code</h3>
                <div className="bg-[#00a651] text-white rounded-lg p-4">
                  <p className="text-sm mb-1 opacity-90">Enter this code:</p>
                  <p className="text-3xl font-bold tracking-widest text-center font-mono">
                    {event.checkInCode}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Members can enter this code instead of scanning the QR code
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Open the NSBE UCF app</li>
                <li>Navigate to "Check In"</li>
                <li>Scan the QR code OR enter the check-in code</li>
                <li>Confirm attendance</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mt-6">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => downloadQR("png")}
                disabled={isLoading}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadQR("svg")}
                disabled={isLoading}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                SVG
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={copyToClipboard}
              disabled={isLoading}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Data URL
            </Button>
            <Button
              onClick={() => setIsFullscreen(true)}
              disabled={isLoading}
              className="w-full bg-[#00a651] hover:bg-[#008a44] text-white"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen Display
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This QR code is unique to this event. Members
          can only check in during the event time window (
          {formatTime(event.startTime)} - {formatTime(event.endTime)}).
        </p>
      </div>
    </Card>
  );
}

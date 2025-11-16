import { Camera, Settings, AlertCircle, CheckSquare } from "lucide-react";
import { Button } from "../ui/button";

interface CameraPermissionDeniedProps {
  onManualCheckIn?: () => void;
  onGoBack?: () => void;
}

export function CameraPermissionDenied({
  onManualCheckIn,
  onGoBack,
}: CameraPermissionDeniedProps) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const browser = navigator.userAgent.includes("Chrome") ? "Chrome" : 
                  navigator.userAgent.includes("Safari") ? "Safari" : 
                  navigator.userAgent.includes("Firefox") ? "Firefox" : "your browser";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Camera className="h-16 w-16 text-white" />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center border-4 border-white">
              <span className="text-white text-2xl">!</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Camera Access Needed</h1>
          <p className="text-lg text-gray-600 mb-6">
            We need permission to access your camera to scan QR codes for event check-in
          </p>

          {/* Instructions Card */}
          <div className="bg-white rounded-lg border border-yellow-200 p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-600" />
              How to enable camera access:
            </h3>
            
            {isIOS && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">1</span>
                  </div>
                  <p className="text-sm text-gray-700">Open your iPhone <strong>Settings</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">2</span>
                  </div>
                  <p className="text-sm text-gray-700">Scroll down and tap <strong>{browser}</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">3</span>
                  </div>
                  <p className="text-sm text-gray-700">Tap <strong>Camera</strong> and select <strong>Allow</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">4</span>
                  </div>
                  <p className="text-sm text-gray-700">Return here and refresh the page</p>
                </div>
              </div>
            )}

            {isAndroid && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">1</span>
                  </div>
                  <p className="text-sm text-gray-700">Tap the address bar at the top</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">2</span>
                  </div>
                  <p className="text-sm text-gray-700">Tap the <strong>lock icon</strong> or <strong>site settings</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">3</span>
                  </div>
                  <p className="text-sm text-gray-700">Tap <strong>Permissions</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">4</span>
                  </div>
                  <p className="text-sm text-gray-700">Set <strong>Camera</strong> to <strong>Allow</strong></p>
                </div>
              </div>
            )}

            {!isMobile && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">1</span>
                  </div>
                  <p className="text-sm text-gray-700">Click the <strong>lock/camera icon</strong> in the address bar</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">2</span>
                  </div>
                  <p className="text-sm text-gray-700">Set Camera permission to <strong>Allow</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-yellow-700">3</span>
                  </div>
                  <p className="text-sm text-gray-700">Refresh this page</p>
                </div>
              </div>
            )}
          </div>

          {/* Alternative Option */}
          {onManualCheckIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-left flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Alternative Check-In</h4>
                  <p className="text-sm text-blue-800">
                    Can't enable camera? You can check in manually by entering the event code.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-[#00843D] hover:bg-[#006830] text-white"
            >
              I've Enabled Camera Access
            </Button>
            
            {onManualCheckIn && (
              <Button
                onClick={onManualCheckIn}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Enter Code Manually
              </Button>
            )}

            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="ghost"
                className="w-full"
              >
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

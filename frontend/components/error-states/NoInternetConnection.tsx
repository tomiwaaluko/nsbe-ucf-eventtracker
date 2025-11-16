import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface NoInternetConnectionProps {
  onRetry?: () => void;
}

export function NoInternetConnection({ onRetry }: NoInternetConnectionProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="relative w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <WifiOff className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">No Internet Connection</h1>
          <p className="text-lg text-gray-600 mb-6">
            Please check your internet connection and try again
          </p>

          {/* Status Indicators */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Troubleshooting Steps:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">1</span>
                </div>
                <p className="text-sm text-gray-700">Check if your Wi-Fi or mobile data is turned on</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">2</span>
                </div>
                <p className="text-sm text-gray-700">Try moving to an area with better signal</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">3</span>
                </div>
                <p className="text-sm text-gray-700">Restart your router or toggle airplane mode</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onRetry}
              className="w-full bg-[#00843D] hover:bg-[#006830] text-white flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
            <p className="text-xs text-gray-500">
              Some features may still be available offline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

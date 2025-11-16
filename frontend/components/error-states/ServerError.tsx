import { ServerCrash, RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

interface ServerErrorProps {
  errorCode?: number;
  errorMessage?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function ServerError({
  errorCode = 500,
  errorMessage = "Something went wrong on our end",
  onRetry,
  onGoHome,
}: ServerErrorProps) {
  const errorDetails = {
    500: {
      title: "Internal Server Error",
      description: "Our server encountered an unexpected error",
      emoji: "🔧",
    },
    502: {
      title: "Bad Gateway",
      description: "We're having trouble connecting to our servers",
      emoji: "🌐",
    },
    503: {
      title: "Service Unavailable",
      description: "Our servers are temporarily unavailable",
      emoji: "⏳",
    },
    504: {
      title: "Gateway Timeout",
      description: "The server took too long to respond",
      emoji: "⏱️",
    },
  };

  const error = errorDetails[errorCode as keyof typeof errorDetails] || errorDetails[500];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="relative w-40 h-40 mx-auto">
            {/* Server illustration */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl transform rotate-6 opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-2xl transform -rotate-3" />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-4">
              <ServerCrash className="h-16 w-16 text-red-500 mb-2" />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
            <span className="text-lg">{error.emoji}</span>
            <span>Error {errorCode}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{error.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{error.description}</p>

          {/* Error Details */}
          <div className="bg-white rounded-lg border border-red-200 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">What happened?</h3>
                <p className="text-sm text-gray-700 mb-4">{errorMessage}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-600">
                  <p className="text-red-600 mb-1">Error Details:</p>
                  <p>Status: {errorCode}</p>
                  <p>Timestamp: {new Date().toLocaleString()}</p>
                  <p className="mt-2 text-gray-500">
                    Reference ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What You Can Do */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">What you can do:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span>•</span>
                <p>Wait a few moments and try again</p>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <p>Check if the issue persists by refreshing the page</p>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <p>If the problem continues, contact a chapter officer</p>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <p>Try accessing a different page of the application</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="w-full bg-[#00843D] hover:bg-[#006830] text-white flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </Button>
            )}
            
            {onGoHome && (
              <Button
                onClick={onGoHome}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
            )}
          </div>

          {/* Support Info */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Need Help?</span> Contact NSBE UCF Tech Team at{" "}
              <a href="mailto:tech@nsbeucf.org" className="text-[#00843D] hover:underline">
                tech@nsbeucf.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

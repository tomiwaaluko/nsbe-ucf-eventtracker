import { Search, Home, ArrowLeft, Compass } from "lucide-react";
import { Button } from "../ui/button";

interface NotFoundProps {
  resourceType?: "page" | "event" | "member" | "resource";
  onGoHome?: () => void;
  onGoBack?: () => void;
  onSearch?: () => void;
}

export function NotFound({
  resourceType = "page",
  onGoHome,
  onGoBack,
  onSearch,
}: NotFoundProps) {
  const messages = {
    page: {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist or has been moved",
      suggestions: [
        "Check if the URL is typed correctly",
        "Use the navigation menu to find what you need",
        "Go back to the previous page",
        "Return to the dashboard",
      ],
    },
    event: {
      title: "Event Not Found",
      description: "This event doesn't exist or may have been deleted",
      suggestions: [
        "The event may have been cancelled",
        "Check if the event ID is correct",
        "Browse all available events",
        "Contact an officer if you think this is an error",
      ],
    },
    member: {
      title: "Member Not Found",
      description: "We couldn't find this member profile",
      suggestions: [
        "The member may not be registered yet",
        "Check if the member ID is correct",
        "Search for the member by name",
        "Contact an admin for assistance",
      ],
    },
    resource: {
      title: "Resource Not Found",
      description: "The resource you're looking for is not available",
      suggestions: [
        "The resource may have been removed",
        "Check if you have the correct link",
        "Browse other available resources",
        "Contact support for help",
      ],
    },
  };

  const message = messages[resourceType];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Large 404 Illustration */}
        <div className="relative mb-12">
          <div className="text-center">
            {/* Giant 404 */}
            <div className="relative inline-block">
              <h1 className="text-[12rem] sm:text-[16rem] font-black text-gray-200 leading-none select-none">
                404
              </h1>
              {/* Compass icon overlaid */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#00843D] to-[#006830] rounded-full flex items-center justify-center shadow-2xl animate-spin-slow">
                  <Compass className="h-16 w-16 text-white" />
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute top-0 left-0 w-8 h-8 bg-[#FFD700] rounded-full animate-float" style={{ animationDelay: "0s" }} />
              <div className="absolute top-1/4 right-0 w-6 h-6 bg-purple-500 rounded-full animate-float" style={{ animationDelay: "0.5s" }} />
              <div className="absolute bottom-1/4 left-1/4 w-5 h-5 bg-blue-500 rounded-full animate-float" style={{ animationDelay: "1s" }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{message.title}</h2>
          <p className="text-lg text-gray-600 mb-8">{message.description}</p>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-[#00843D] transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-[#00843D]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#00843D] transition-colors">
                <Home className="h-6 w-6 text-[#00843D] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Dashboard</h3>
              <p className="text-sm text-gray-600">View your progress and upcoming events</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-blue-500 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
                <Search className="h-6 w-6 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Search</h3>
              <p className="text-sm text-gray-600">Find events, members, and resources</p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-4">💡 Suggestions:</h3>
            <div className="space-y-2">
              {message.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-700">{index + 1}</span>
                  </div>
                  <p className="text-sm text-blue-800">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}

            {onGoHome && (
              <Button
                onClick={onGoHome}
                className="bg-[#00843D] hover:bg-[#006830] text-white flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            )}

            {onSearch && (
              <Button
                onClick={onSearch}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            )}
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 italic">
            "Not all who wander are lost... but this page definitely is." 🧭
          </p>
        </div>
      </div>
    </div>
  );
}

<style jsx>{`
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
`}</style>

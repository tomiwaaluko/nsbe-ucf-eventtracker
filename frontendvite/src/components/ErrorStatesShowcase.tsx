import { useState } from "react";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

// Import all error states
import { NoInternetConnection } from "./error-states/NoInternetConnection";
import { CheckInFailed } from "./error-states/CheckInFailed";
import { CameraPermissionDenied } from "./error-states/CameraPermissionDenied";
import { EventFull } from "./error-states/EventFull";
import { NoUpcomingEvents } from "./error-states/NoUpcomingEvents";
import { NoAchievements } from "./error-states/NoAchievements";
import { ServerError } from "./error-states/ServerError";
import { NotFound } from "./error-states/NotFound";
import {
  FormValidation,
  FieldValidation,
  ValidationSummary,
  ValidationIndicator,
} from "./error-states/FormValidation";
import { SuccessConfirmation } from "./error-states/SuccessConfirmation";

interface ErrorStatesShowcaseProps {
  onBack: () => void;
}

type ErrorStateType =
  | "no-internet"
  | "check-in-failed"
  | "camera-denied"
  | "event-full"
  | "no-events"
  | "no-achievements"
  | "server-error"
  | "not-found"
  | "none";

export function ErrorStatesShowcase({ onBack }: ErrorStatesShowcaseProps) {
  const [activeState, setActiveState] = useState<ErrorStateType>("none");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const errorStates = [
    { id: "no-internet" as const, label: "No Internet Connection", color: "bg-red-500" },
    { id: "check-in-failed" as const, label: "Check-In Failed", color: "bg-orange-500" },
    { id: "camera-denied" as const, label: "Camera Permission Denied", color: "bg-yellow-500" },
    { id: "event-full" as const, label: "Event Full", color: "bg-orange-600" },
    { id: "no-events" as const, label: "No Upcoming Events", color: "bg-blue-500" },
    { id: "no-achievements" as const, label: "No Achievements", color: "bg-purple-500" },
    { id: "server-error" as const, label: "Server Error (500)", color: "bg-red-600" },
    { id: "not-found" as const, label: "Not Found (404)", color: "bg-gray-600" },
  ];

  const handleDismiss = () => {
    setActiveState("none");
    setShowSuccess(false);
    setShowValidation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Error States Showcase</h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                View all error, empty, and success states
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="bg-gradient-to-br from-[#00843D] to-[#006830] rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-3">Error & Success States</h2>
          <p className="text-lg text-white/90 mb-4">
            Comprehensive collection of error states, empty states, form validation, and success confirmations for the NSBE UCF Event Tracker.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm text-white/80">Error States</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold">5</div>
              <div className="text-sm text-white/80">Empty States</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold">4</div>
              <div className="text-sm text-white/80">Validation Types</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold">7</div>
              <div className="text-sm text-white/80">Success Types</div>
            </div>
          </div>
        </div>

        {/* Error States Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error & Empty States</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {errorStates.map((state) => (
              <button
                key={state.id}
                onClick={() => setActiveState(state.id)}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 text-left hover:border-[#00843D] transition-all hover:shadow-lg group"
              >
                <div className={`w-12 h-12 ${state.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{state.label}</h3>
                <p className="text-sm text-gray-500">Click to preview</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form Validation Examples */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Validation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inline Validation */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Inline Field Validation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border-2 border-red-500 rounded-lg"
                    value="invalid-email"
                  />
                  <FieldValidation type="error" message="Please enter a valid email address" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border-2 border-green-500 rounded-lg"
                    value="********"
                  />
                  <FieldValidation type="success" message="Strong password!" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border-2 border-yellow-500 rounded-lg"
                    value="user123"
                  />
                  <FieldValidation type="warning" message="Username is already taken" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter code..."
                  />
                  <ValidationIndicator isValid={false} isValidating={true} />
                </div>
              </div>
            </div>

            {/* Banner Validation */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Banner & Modal Validation</h3>
              
              <button
                onClick={() => setShowValidation(true)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mb-4"
              >
                Show Validation Modal
              </button>

              <FormValidation
                errors={[
                  { field: "Event Name", message: "This field is required" },
                  { field: "Event Date", message: "Please select a future date" },
                ]}
                type="banner"
              />

              <div className="mt-4">
                <ValidationSummary
                  errors={[
                    { field: "Email", message: "Invalid format" },
                  ]}
                  warnings={[
                    { field: "Phone", message: "Phone number is optional but recommended" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Confirmations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Success Confirmations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: "check-in" as const, label: "Check-In Success" },
              { type: "event-created" as const, label: "Event Created" },
              { type: "profile-updated" as const, label: "Profile Updated" },
              { type: "settings-saved" as const, label: "Settings Saved" },
            ].map((success) => (
              <button
                key={success.type}
                onClick={() => {
                  toast.success(success.label, {
                    description: "Action completed successfully",
                  });
                }}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 text-left hover:border-green-500 transition-all hover:shadow-lg group"
              >
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{success.label}</h3>
                <p className="text-sm text-gray-500">Click for toast</p>
              </button>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Modal Success Confirmation</h3>
            <Button
              onClick={() => setShowSuccess(true)}
              className="bg-[#00843D] hover:bg-[#006830] text-white"
            >
              Show Success Modal
            </Button>
          </div>
        </div>

        {/* Design Principles */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Design Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">✅ Do's</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use color-coded feedback (red=error, yellow=warning, green=success)</li>
                <li>• Provide clear, actionable error messages</li>
                <li>• Include helpful suggestions and next steps</li>
                <li>• Use illustrations and icons for visual clarity</li>
                <li>• Maintain consistent styling across all states</li>
                <li>• Ensure all states are accessible (WCAG AA)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">❌ Don'ts</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Don't use technical jargon in error messages</li>
                <li>• Don't blame the user for errors</li>
                <li>• Don't leave users without a way to recover</li>
                <li>• Don't use generic "Error" messages</li>
                <li>• Don't rely solely on color to convey meaning</li>
                <li>• Don't auto-dismiss critical error messages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modals */}
      {activeState !== "none" && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" onClick={handleDismiss} />
          <div className="relative z-10">
            {activeState === "no-internet" && <NoInternetConnection onRetry={handleDismiss} />}
            {activeState === "check-in-failed" && (
              <CheckInFailed
                errorType="invalid-code"
                onTryAgain={handleDismiss}
                onGoBack={handleDismiss}
              />
            )}
            {activeState === "camera-denied" && (
              <CameraPermissionDenied
                onManualCheckIn={handleDismiss}
                onGoBack={handleDismiss}
              />
            )}
            {activeState === "event-full" && (
              <EventFull
                eventName="Fall GBM #4"
                eventDate="November 20, 2024 at 6:00 PM"
                maxCapacity={50}
                onJoinWaitlist={handleDismiss}
                onBrowseEvents={handleDismiss}
                onGoBack={handleDismiss}
              />
            )}
            {activeState === "no-events" && (
              <NoUpcomingEvents
                isAdmin={false}
                onEnableNotifications={handleDismiss}
                onViewPastEvents={handleDismiss}
              />
            )}
            {activeState === "no-achievements" && (
              <NoAchievements
                memberName="John"
                onBrowseEvents={handleDismiss}
              />
            )}
            {activeState === "server-error" && (
              <ServerError
                errorCode={500}
                onRetry={handleDismiss}
                onGoHome={handleDismiss}
              />
            )}
            {activeState === "not-found" && (
              <NotFound
                resourceType="page"
                onGoHome={handleDismiss}
                onGoBack={handleDismiss}
              />
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <SuccessConfirmation
          type="check-in"
          details={[
            { label: "Event", value: "Fall GBM #4" },
            { label: "Date", value: "Nov 20, 2024" },
            { label: "Time", value: "6:15 PM" },
          ]}
          actions={[
            { label: "View Profile", onClick: () => setShowSuccess(false), variant: "primary" },
            { label: "Browse Events", onClick: () => setShowSuccess(false), variant: "secondary" },
          ]}
          onDismiss={() => setShowSuccess(false)}
          showConfetti={true}
        />
      )}

      {/* Validation Modal */}
      {showValidation && (
        <FormValidation
          errors={[
            { field: "Event Name", message: "This field is required" },
            { field: "Event Date", message: "Date must be in the future" },
            { field: "Max Capacity", message: "Must be between 1 and 500" },
          ]}
          type="modal"
          onDismiss={() => setShowValidation(false)}
        />
      )}
    </div>
  );
}

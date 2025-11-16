import { useState } from "react";
import { Button } from "./ui/button";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Target,
  Users,
} from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
  userName: string;
}

export function Onboarding({ onComplete, userName }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "welcome",
      icon: "👋",
      title: `Welcome, ${userName}!`,
      subtitle: "Let's get you started with NSBE UCF Event Tracker",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00843D] to-[#006830] rounded-full text-4xl mb-4">
              👋
            </div>
            <p className="text-lg text-gray-700 max-w-md mx-auto">
              We're excited to have you join the NSBE UCF community! This quick
              tour will help you understand how to track your involvement and
              progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-[#00843D]/10 to-[#00843D]/5 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#00843D] rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Track Events</h3>
              <p className="text-sm text-gray-600">
                Monitor your attendance at workshops, GBMs, and service events
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFD700]/5 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Reach Goals</h3>
              <p className="text-sm text-gray-600">
                Complete your 1-1-1 and 3-3-3 requirements
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#DC143C]/10 to-[#DC143C]/5 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#DC143C] rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Stay Connected
              </h3>
              <p className="text-sm text-gray-600">
                Never miss important NSBE events and activities
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "111-explained",
      icon: "1️⃣",
      title: "Understanding 1-1-1",
      subtitle: "Your foundation as a NSBE-UCF member",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#00843D] to-[#006830] rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-6xl font-bold">1-1-1</div>
              <div className="h-16 w-1 bg-white/30 rounded-full" />
              <div>
                <h3 className="text-2xl font-bold">Minimum Requirement</h3>
                <p className="text-white/90">
                  To be eligible for Region III Fall Regional Conference
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border-2 border-[#00843D] rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-[#00843D] rounded-xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    Workshop / Social Event
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      SOCIAL_AEX
                    </span>
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Attend at least one professional development workshop,
                    technical training, or social/academic excellence event.
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Examples: Resume workshops, coding sessions, networking
                    mixers, study groups
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#FFD700] rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-[#FFD700] rounded-xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    General Body Meeting (GBM)
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      GBM
                    </span>
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Attend at least one chapter meeting to stay informed about
                    chapter activities, initiatives, and opportunities.
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Usually held twice a month to engage with members and stay
                    updated on upcoming events.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#DC143C] rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-[#DC143C] rounded-xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    Community Service / Fundraiser
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      SERVICE
                    </span>
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">
                    Participate in at least one community service project or
                    fundraising event to give back to the community.
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Examples: Food drives, tutoring, beach cleanups, STEM
                    outreach, fundraising events
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Pro Tip:</span> Complete your
              1-1-1 early in the semester to be first priority in FRC selection!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "333-explained",
      icon: "3️⃣",
      title: "Understanding 3-3-3",
      subtitle: "Strive for excellence and deeper involvement",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#FFD700] to-[#FFC700] rounded-2xl p-8 text-gray-900">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-16 w-16" />
              <div>
                <div className="text-6xl font-bold">3-3-3</div>
                <p className="text-lg font-medium">
                  Requirement for Annual Convention
                </p>
                <p className="text-gray-700">For highly engaged members</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#00843D]/10 to-[#FFD700]/10 rounded-xl p-6 border-2 border-[#FFD700]">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FFD700]" />
              Why Aim for 3-3-3?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#00843D] font-bold">✓</span>
                <span>
                  Maximize your professional development and networking
                  opportunities
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00843D] font-bold">✓</span>
                <span>
                  Build stronger connections within the NSBE community
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00843D] font-bold">✓</span>
                <span>Make a greater impact through community service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00843D] font-bold">✓</span>
                <span>
                  Demonstrate exceptional commitment to potential employers
                </span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-[#00843D] rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-[#00843D] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">
                Workshops/Social Event
              </h4>
              <p className="text-sm text-gray-600">
                Attend three workshops, trainings, or social/academic events.
              </p>
            </div>

            <div className="bg-white border-2 border-[#FFD700] rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-gray-900">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">GBMs</h4>
              <p className="text-sm text-gray-600">
                Attend three general body meetings to stay fully engaged with
                chapter activities
              </p>
            </div>

            <div className="bg-white border-2 border-[#DC143C] rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-[#DC143C] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Service Events</h4>
              <p className="text-sm text-gray-600">
                Participate in three community service or fundraising events.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFD700]/10 border-2 border-[#FFD700] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-[#FFD700] flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Recognition & Benefits
                </p>
                <p className="text-sm text-gray-700">
                  Members who achieve 3-3-3 receive special recognition,
                  priority access to exclusive events, and enhanced leadership
                  opportunities within the chapter.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "how-to-use",
      icon: "📱",
      title: "How to Use the Tracker",
      subtitle: "Quick guide to checking in and tracking progress",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">
              Getting Started is Easy!
            </h3>
            <p className="text-white/90">
              Follow these simple steps to track your journey
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#00843D] rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Check In at Events
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    When you arrive at an event, scan the QR code displayed by
                    event organizers or use the manual check-in option.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      Event Check-In Options:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>
                        • <span className="font-medium">QR Code:</span> Scan the
                        code at the event
                      </li>
                      <li>
                        • <span className="font-medium">Manual:</span> Officers
                        can check you in directly
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">
                    View Your Dashboard
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Your dashboard shows your progress toward 1-1-1 and 3-3-3
                    goals in real-time with visual progress bars and charts.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-purple-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600 mb-1">Workshops</p>
                      <p className="font-bold text-purple-700">2/3</p>
                    </div>
                    <div className="bg-blue-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600 mb-1">GBMs</p>
                      <p className="font-bold text-blue-700">3/3</p>
                    </div>
                    <div className="bg-green-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600 mb-1">Service</p>
                      <p className="font-bold text-green-700">1/3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#DC143C] rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Browse Upcoming Events
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Check the Events page to see what's coming up and plan your
                    attendance to reach your goals.
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      Workshops
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      GBMs
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      Service
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">4</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Track Your History
                  </h4>
                  <p className="text-gray-600 text-sm">
                    View your complete attendance history in your profile to see
                    all the events you've attended and your overall progress.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#00843D]/10 to-[#FFD700]/10 rounded-lg p-4 border border-[#00843D]/20">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">🎯 Remember:</span> Your
              attendance is automatically tracked once you check in. Just focus
              on engaging with events and building your professional network!
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={onComplete}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index <= currentStep ? "bg-[#00843D]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentStepData.icon}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600">{currentStepData.subtitle}</p>
          </div>

          {/* Step Content */}
          <div className="mb-8">{currentStepData.content}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentStep === 0}
              className={currentStep === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-[#00843D] w-8"
                      : index < currentStep
                      ? "bg-[#00843D]/50"
                      : "bg-gray-300"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-[#00843D] hover:bg-[#006830] text-white"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Questions?{" "}
            <a
              href="mailto:support@nsbeucf.org"
              className="text-[#00843D] hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

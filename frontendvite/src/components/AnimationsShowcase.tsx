import { useState } from "react";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

// Import animated components
import { AnimatedButton } from "./animations/AnimatedButton";
import {
  AnimatedCard,
  AnimatedEventCard,
  AnimatedProgressCard,
} from "./animations/AnimatedCard";
import { AnimatedTable } from "./animations/AnimatedTable";
import { AnimatedModal, AnimatedConfirmModal, AnimatedBottomSheet } from "./animations/AnimatedModal";
import { AnimatedSidebar } from "./animations/AnimatedSidebar";
import {
  AchievementUnlocked,
  AchievementToast,
  useAchievementNotification,
} from "./animations/AchievementUnlocked";

interface AnimationsShowcaseProps {
  onBack: () => void;
}

export function AnimationsShowcase({ onBack }: AnimationsShowcaseProps) {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const { achievement, showAchievement, dismissAchievement } = useAchievementNotification();
  const [showToastAchievement, setShowToastAchievement] = useState(false);

  const triggerAchievement = () => {
    showAchievement({
      id: "111-complete",
      title: "1-1-1 Complete!",
      description: "You've completed 1 Workshop, 1 GBM, and 1 Community Service event",
      icon: "trophy",
      color: "gold",
    });
  };

  const triggerToastAchievement = () => {
    setShowToastAchievement(true);
  };

  const tableData = [
    { event: "Fall GBM #4", type: "GBM", date: "Nov 20", attendees: "45" },
    { event: "Resume Workshop", type: "Workshop", date: "Nov 22", attendees: "30" },
    { event: "Food Drive", type: "Service", date: "Nov 25", attendees: "25" },
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Animations Showcase</h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                Interactive micro-animations and transitions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="bg-gradient-to-br from-[#00843D] to-[#006830] rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-3">Micro-Interactions & Animations</h2>
          <p className="text-lg text-white/90 mb-4">
            Explore smooth, modern animations powered by Framer Motion (Motion)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm text-white/80">Component Types</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold">20+</div>
              <div className="text-sm text-white/80">Animations</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold">60fps</div>
              <div className="text-sm text-white/80">Performance</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold">Spring</div>
              <div className="text-sm text-white/80">Physics</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Animated Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Scale Animation</h3>
              <div className="flex flex-wrap gap-3">
                <AnimatedButton variant="primary" animationType="scale">
                  Hover Me
                </AnimatedButton>
                <AnimatedButton variant="secondary" animationType="scale">
                  Secondary
                </AnimatedButton>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Lift Animation</h3>
              <div className="flex flex-wrap gap-3">
                <AnimatedButton variant="primary" animationType="lift">
                  Lift Effect
                </AnimatedButton>
                <AnimatedButton variant="destructive" animationType="lift">
                  Delete
                </AnimatedButton>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Glow Animation</h3>
              <div className="flex flex-wrap gap-3">
                <AnimatedButton variant="primary" animationType="glow">
                  Glow Effect
                </AnimatedButton>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ripple Animation</h3>
              <div className="flex flex-wrap gap-3">
                <AnimatedButton variant="primary" animationType="ripple">
                  Click for Ripple
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Animated Cards</h2>
          
          {/* Event Cards */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Event Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedEventCard
                title="Fall GBM #4"
                type="GBM"
                date="Nov 20"
                time="6:00 PM - 7:30 PM"
                location="Engineering 101"
                attendees="45 / 100"
                color="blue"
                onClick={() => toast.success("Event card clicked!")}
                delay={0}
              />
              <AnimatedEventCard
                title="Resume Workshop"
                type="Workshop"
                date="Nov 22"
                time="5:00 PM - 7:00 PM"
                color="purple"
                onClick={() => toast.success("Event card clicked!")}
                delay={0.1}
              />
              <AnimatedEventCard
                title="Food Drive"
                type="Service"
                date="Nov 25"
                time="10:00 AM - 2:00 PM"
                color="green"
                onClick={() => toast.success("Event card clicked!")}
                delay={0.2}
              />
            </div>
          </div>

          {/* Progress Cards */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Progress Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedProgressCard
                label="Workshops"
                current={2}
                total={3}
                color="purple"
                delay={0}
              />
              <AnimatedProgressCard
                label="GBMs"
                current={3}
                total={3}
                color="blue"
                delay={0.1}
              />
              <AnimatedProgressCard
                label="Service"
                current={1}
                total={3}
                color="green"
                delay={0.2}
              />
            </div>
          </div>

          {/* Card Variants */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Card Hover Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedCard variant="hover-lift" onClick={() => toast("Lift variant")}>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Hover Lift</h4>
                  <p className="text-sm text-gray-600">Lifts up on hover</p>
                </div>
              </AnimatedCard>
              <AnimatedCard variant="hover-glow" onClick={() => toast("Glow variant")}>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Hover Glow</h4>
                  <p className="text-sm text-gray-600">Glows on hover</p>
                </div>
              </AnimatedCard>
              <AnimatedCard variant="hover-border" onClick={() => toast("Border variant")}>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Hover Border</h4>
                  <p className="text-sm text-gray-600">Border changes color</p>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Animated Tables</h2>
          <AnimatedTable
            headers={["Event", "Type", "Date", "Attendees"]}
            data={tableData}
            onRowClick={(row) => toast(`Clicked: ${row.event}`)}
          />
        </div>

        {/* Modals & Overlays */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Modals & Overlays</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatedCard onClick={() => setShowModal(true)}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Modal</h4>
                <p className="text-sm text-gray-600">Spring animation</p>
              </div>
            </AnimatedCard>

            <AnimatedCard onClick={() => setShowConfirm(true)}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Confirm Modal</h4>
                <p className="text-sm text-gray-600">With emoji</p>
              </div>
            </AnimatedCard>

            <AnimatedCard onClick={() => setShowBottomSheet(true)}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Bottom Sheet</h4>
                <p className="text-sm text-gray-600">Slide up (mobile)</p>
              </div>
            </AnimatedCard>

            <AnimatedCard onClick={() => setShowSidebar(true)}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-[#00843D]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-[#00843D]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Sidebar</h4>
                <p className="text-sm text-gray-600">Slide from left</p>
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* Achievement Animations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievement Unlocked</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedCard onClick={triggerAchievement}>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🏆</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Full Achievement Modal</h4>
                <p className="text-sm text-gray-600">With confetti and animations</p>
              </div>
            </AnimatedCard>

            <AnimatedCard onClick={triggerToastAchievement}>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">⭐</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Toast Notification</h4>
                <p className="text-sm text-gray-600">Compact version</p>
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* Animation Principles */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Animation Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">✨ Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Spring-based physics for natural movement</li>
                <li>• Stagger animations for sequential reveals</li>
                <li>• Gesture support (drag, tap, hover)</li>
                <li>• Layout animations with automatic smoothing</li>
                <li>• Exit animations when elements unmount</li>
                <li>• 60fps performance with GPU acceleration</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⚡ Best Practices</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Keep animations under 300ms for responsiveness</li>
                <li>• Use spring physics for interactive elements</li>
                <li>• Add subtle hover states for affordance</li>
                <li>• Stagger animations in lists (0.05-0.1s delays)</li>
                <li>• Provide reduced motion alternatives</li>
                <li>• Test on low-powered devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Animated Modal"
        animation="spring"
      >
        <p className="text-gray-600 mb-4">
          This modal uses spring-based physics for smooth, natural animations.
        </p>
        <AnimatedButton
          variant="primary"
          onClick={() => setShowModal(false)}
          className="w-full"
        >
          Close Modal
        </AnimatedButton>
      </AnimatedModal>

      <AnimatedConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => toast.success("Confirmed!")}
        title="Are you sure?"
        message="This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      <AnimatedBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Bottom Sheet"
      >
        <p className="text-gray-600 mb-4">
          This bottom sheet slides up from the bottom and supports drag-to-dismiss on mobile.
        </p>
        <AnimatedButton
          variant="primary"
          onClick={() => setShowBottomSheet(false)}
          className="w-full"
        >
          Close
        </AnimatedButton>
      </AnimatedBottomSheet>

      <AnimatedSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userName="John Doe"
        userRole="member"
      />

      <AchievementUnlocked
        achievement={achievement}
        onDismiss={dismissAchievement}
      />

      <AchievementToast
        achievement={
          showToastAchievement
            ? {
                id: "workshop-master",
                title: "Workshop Master",
                description: "Attended 5 workshops",
                icon: "star",
                color: "purple",
              }
            : null
        }
        onDismiss={() => setShowToastAchievement(false)}
      />
    </div>
  );
}

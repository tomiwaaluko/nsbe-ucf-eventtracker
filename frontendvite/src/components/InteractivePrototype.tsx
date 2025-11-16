import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Home,
  Calendar,
  QrCode,
  Award,
  Settings,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  Trophy,
  Users,
  MapPin,
  Clock,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "./ui/button";

interface InteractivePrototypeProps {
  onBack: () => void;
}

type FlowStep =
  | "dashboard"
  | "event-list"
  | "event-detail"
  | "check-in"
  | "success";

export function InteractivePrototype({ onBack }: InteractivePrototypeProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [achievementProgress, setAchievementProgress] = useState(0);

  // Auto-play flow
  const playFlow = async () => {
    setIsPlaying(true);
    setCurrentStep("dashboard");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCurrentStep("event-list");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCurrentStep("event-detail");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCurrentStep("check-in");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCurrentStep("success");
    setIsPlaying(false);
  };

  const stopFlow = () => {
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Interactive Prototype
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Experience the flow with animations
                </p>
              </div>
            </div>

            {/* Flow Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={isPlaying ? stopFlow : playFlow}
                className="bg-[#00843D] hover:bg-[#006830] text-white flex items-center gap-2"
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play Flow
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Flow Steps Indicator */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              User Flow Progress
            </h3>
            <div className="flex items-center justify-between">
              {[
                { id: "dashboard", label: "Dashboard", icon: Home },
                { id: "event-list", label: "Event List", icon: Calendar },
                { id: "event-detail", label: "Event Detail", icon: Calendar },
                { id: "check-in", label: "Check-In", icon: QrCode },
                { id: "success", label: "Success", icon: CheckCircle2 },
              ].map((step, index, array) => (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() =>
                      !isPlaying && setCurrentStep(step.id as FlowStep)
                    }
                    className="flex flex-col items-center gap-2 group"
                    disabled={isPlaying}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        currentStep === step.id
                          ? "bg-[#00843D] text-white"
                          : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                      }`}
                      animate={{
                        scale: currentStep === step.id ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <step.icon className="h-6 w-6" />
                    </motion.div>
                    <span className="text-xs font-medium text-gray-700">
                      {step.label}
                    </span>
                  </button>
                  {index < array.length - 1 && (
                    <div className="flex-1 h-1 bg-gray-200 mx-2">
                      <motion.div
                        className="h-full bg-[#00843D]"
                        initial={{ width: "0%" }}
                        animate={{
                          width:
                            array.findIndex((s) => s.id === currentStep) > index
                              ? "100%"
                              : "0%",
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prototype Frame */}
        <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl">
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ height: "600px" }}
          >
            {/* Mobile Frame */}
            <div className="h-full flex">
              {/* Sidebar Overlay (Mobile) */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSidebarOpen(false)}
                      className="fixed inset-0 bg-black/50 z-40"
                    />
                    <motion.div
                      initial={{ x: -300 }}
                      animate={{ x: 0 }}
                      exit={{ x: -300 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 200,
                      }}
                      className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50"
                    >
                      <PrototypeSidebar
                        currentStep={currentStep}
                        onNavigate={(step) => {
                          setCurrentStep(step);
                          setIsSidebarOpen(false);
                        }}
                        onClose={() => setIsSidebarOpen(false)}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Main Content */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <h2 className="font-semibold text-gray-900">NSBE UCF</h2>
                  <div className="w-9" />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {currentStep === "dashboard" && (
                      <DashboardScreen
                        key="dashboard"
                        onViewEvents={() => setCurrentStep("event-list")}
                      />
                    )}
                    {currentStep === "event-list" && (
                      <EventListScreen
                        key="event-list"
                        onSelectEvent={() => setCurrentStep("event-detail")}
                      />
                    )}
                    {currentStep === "event-detail" && (
                      <EventDetailScreen
                        key="event-detail"
                        onCheckIn={() => setCurrentStep("check-in")}
                      />
                    )}
                    {currentStep === "check-in" && (
                      <CheckInScreen
                        key="check-in"
                        onSuccess={() => setCurrentStep("success")}
                      />
                    )}
                    {currentStep === "success" && (
                      <SuccessScreen
                        key="success"
                        onGoBack={() => setCurrentStep("dashboard")}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Guide */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <InteractionCard
            title="Hover Effects"
            description="Hover over buttons, cards, and navigation items to see smooth transitions"
            icon="🖱️"
          />
          <InteractionCard
            title="Modal Transitions"
            description="Click 'Show Modal' to see smooth open/close animations"
            icon="🪟"
            action={
              <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                className="mt-2"
              >
                Show Modal
              </Button>
            }
          />
          <InteractionCard
            title="Progress Animation"
            description="Watch achievement progress bars fill smoothly"
            icon="📊"
            action={
              <Button
                onClick={() => {
                  setAchievementProgress(0);
                  setTimeout(() => setAchievementProgress(66), 100);
                }}
                variant="outline"
                className="mt-2"
              >
                Animate Progress
              </Button>
            }
          />
        </div>

        {/* Progress Animation Demo */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Live Progress Animation
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Workshops</span>
                <span className="font-medium text-gray-900">
                  {achievementProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${achievementProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Demo */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Modal Demo</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                This modal demonstrates smooth spring animations for opening and
                closing.
              </p>
              <Button
                onClick={() => setShowModal(false)}
                className="w-full bg-[#00843D] hover:bg-[#006830] text-white"
              >
                Close Modal
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sidebar Component
function PrototypeSidebar({
  currentStep,
  onNavigate,
  onClose,
}: {
  currentStep: FlowStep;
  onNavigate: (step: FlowStep) => void;
  onClose: () => void;
}) {
  const menuItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: Home },
    { id: "event-list" as const, label: "Events", icon: Calendar },
    { id: "check-in" as const, label: "Check In", icon: QrCode },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#00843D] to-[#006830] text-white p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-[#00843D]">N</span>
          </div>
          <span className="font-bold">NSBE UCF</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentStep === item.id ? "bg-white/20" : "hover:bg-white/10"
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  );
}

// Dashboard Screen
function DashboardScreen({ onViewEvents }: { onViewEvents: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Welcome Card */}
      <motion.div
        className="bg-gradient-to-br from-[#00843D] to-[#006830] rounded-xl p-6 text-white"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>
        <p className="text-white/90">You have 3 upcoming events</p>
      </motion.div>

      {/* Progress Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Workshops", value: "2/3", color: "purple" },
          { label: "GBMs", value: "3/3", color: "blue" },
          { label: "Service", value: "1/3", color: "green" },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              y: -4,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer"
          >
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-600">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
          <motion.button
            onClick={onViewEvents}
            className="text-sm text-[#00843D] hover:text-[#006830] font-medium flex items-center gap-1"
            whileHover={{ x: 4 }}
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="space-y-3">
          {[1, 2].map((event, index) => (
            <motion.div
              key={event}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer"
            >
              <div className="font-semibold text-gray-900 mb-1">
                Fall GBM #{event}
              </div>
              <div className="text-sm text-gray-600">
                Nov {20 + event}, 2024 • 6:00 PM
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Event List Screen
function EventListScreen({ onSelectEvent }: { onSelectEvent: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-4"
    >
      <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>

      {[
        { name: "Fall GBM #4", type: "GBM", date: "Nov 20", color: "blue" },
        {
          name: "Resume Workshop",
          type: "Workshop",
          date: "Nov 22",
          color: "purple",
        },
        { name: "Food Drive", type: "Service", date: "Nov 25", color: "green" },
      ].map((event, index) => (
        <motion.div
          key={event.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectEvent}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
        >
          <div className={`h-2 bg-${event.color}-500`} />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`px-2 py-1 bg-${event.color}-100 text-${event.color}-700 rounded text-xs font-medium`}
              >
                {event.type}
              </span>
              <span className="text-sm text-gray-500">{event.date}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{event.name}</h3>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Event Detail Screen
function EventDetailScreen({ onCheckIn }: { onCheckIn: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
          GBM
        </span>
        <h2 className="text-2xl font-bold mt-3 mb-2">Fall GBM #4</h2>
        <p className="text-white/90">General body meeting</p>
      </div>

      <div className="space-y-3">
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 text-gray-700"
        >
          <Clock className="h-5 w-5 text-gray-400" />
          <span>6:00 PM - 7:30 PM</span>
        </motion.div>
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 text-gray-700"
        >
          <MapPin className="h-5 w-5 text-gray-400" />
          <span>Engineering Building 101</span>
        </motion.div>
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 text-gray-700"
        >
          <Users className="h-5 w-5 text-gray-400" />
          <span>45 / 100 attendees</span>
        </motion.div>
      </div>

      <motion.button
        onClick={onCheckIn}
        className="w-full py-3 bg-[#00843D] hover:bg-[#006830] text-white rounded-lg font-semibold"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Check In Now
      </motion.button>
    </motion.div>
  );
}

// Check-In Screen
function CheckInScreen({ onSuccess }: { onSuccess: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col items-center justify-center h-full"
    >
      <motion.div
        className="w-64 h-64 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <QrCode className="h-32 w-32 text-white/20 absolute" />
        <div className="absolute inset-4 border-4 border-[#00843D] rounded-xl">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white" />
        </div>
        <motion.div
          className="absolute inset-x-0 top-1/2 h-1 bg-[#00843D]"
          animate={{ y: [-100, 100] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <p className="text-gray-700 font-medium mb-2">Scanning QR Code...</p>
      <p className="text-sm text-gray-500 mb-6">Position code within frame</p>

      <motion.button
        onClick={onSuccess}
        className="px-6 py-2 bg-[#00843D] hover:bg-[#006830] text-white rounded-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Simulate Success
      </motion.button>
    </motion.div>
  );
}

// Success Screen
function SuccessScreen({ onGoBack }: { onGoBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="p-6 flex flex-col items-center justify-center h-full"
    >
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 400, y: -20, rotate: 0 }}
            animate={{ y: 600, rotate: 360 }}
            transition={{
              duration: 2 + Math.random(),
              delay: Math.random() * 0.5,
            }}
            className="absolute w-2 h-2 bg-[#FFD700] rounded-full"
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 bg-gradient-to-br from-[#00843D] to-[#006830] rounded-full flex items-center justify-center mb-6 relative"
      >
        <CheckCircle2 className="h-12 w-12 text-white" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center border-4 border-white"
        >
          <Trophy className="h-5 w-5 text-gray-900" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-900 mb-2"
      >
        Check-In Successful!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 mb-6 text-center"
      >
        Your attendance has been recorded for Fall GBM #4
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onGoBack}
        className="px-6 py-3 bg-[#00843D] hover:bg-[#006830] text-white rounded-lg font-semibold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Dashboard
      </motion.button>
    </motion.div>
  );
}

// Interaction Card
function InteractionCard({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      {action}
    </motion.div>
  );
}

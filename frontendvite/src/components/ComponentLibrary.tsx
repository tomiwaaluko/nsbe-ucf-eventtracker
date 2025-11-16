import { useState } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { DesignTokens } from "./ui-library/DesignTokens";
import { ButtonShowcase } from "./ui-library/ButtonShowcase";
import { InputShowcase } from "./ui-library/InputShowcase";
import { SelectShowcase } from "./ui-library/SelectShowcase";
import { ChipShowcase } from "./ui-library/ChipShowcase";
import { ModalShowcase } from "./ui-library/ModalShowcase";
import { ToastShowcase } from "./ui-library/ToastShowcase";
import { PaginationShowcase } from "./ui-library/PaginationShowcase";
import { TabShowcase } from "./ui-library/TabShowcase";
import { TableShowcase } from "./ui-library/TableShowcase";
import { CardShowcase } from "./ui-library/CardShowcase";
import { BadgeShowcase } from "./ui-library/BadgeShowcase";
import { ProgressShowcase } from "./ui-library/ProgressShowcase";
import { QRScannerShowcase } from "./ui-library/QRScannerShowcase";
import { EmptyStateShowcase } from "./ui-library/EmptyStateShowcase";

interface ComponentLibraryProps {
  onBack: () => void;
}

type Section = 
  | "overview"
  | "tokens"
  | "buttons"
  | "inputs"
  | "selects"
  | "chips"
  | "modals"
  | "toasts"
  | "pagination"
  | "tabs"
  | "tables"
  | "cards"
  | "badges"
  | "progress"
  | "qr"
  | "empty";

export function ComponentLibrary({ onBack }: ComponentLibraryProps) {
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const sections = [
    { id: "overview" as const, label: "Overview", emoji: "📚" },
    { id: "tokens" as const, label: "Design Tokens", emoji: "🎨" },
    { id: "buttons" as const, label: "Buttons", emoji: "🔘" },
    { id: "inputs" as const, label: "Inputs", emoji: "📝" },
    { id: "selects" as const, label: "Selects", emoji: "📋" },
    { id: "chips" as const, label: "Multi-Select Chips", emoji: "🏷️" },
    { id: "modals" as const, label: "Modals", emoji: "🪟" },
    { id: "toasts" as const, label: "Toasts", emoji: "🔔" },
    { id: "pagination" as const, label: "Pagination", emoji: "📄" },
    { id: "tabs" as const, label: "Tabs", emoji: "📑" },
    { id: "tables" as const, label: "Data Tables", emoji: "📊" },
    { id: "cards" as const, label: "Cards", emoji: "🎴" },
    { id: "badges" as const, label: "Badges & Tags", emoji: "🏅" },
    { id: "progress" as const, label: "Progress Indicators", emoji: "📈" },
    { id: "qr" as const, label: "QR Scanner", emoji: "📱" },
    { id: "empty" as const, label: "Empty States", emoji: "🗂️" },
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
              <h1 className="text-2xl font-bold text-gray-900">Component Library</h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                NSBE UCF Event Tracker Design System
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sticky top-24">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeSection === section.id
                      ? "bg-[#00843D] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{section.emoji}</span>
                  <span className="font-medium text-sm">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === "overview" && <OverviewSection />}
            {activeSection === "tokens" && <DesignTokens />}
            {activeSection === "buttons" && <ButtonShowcase />}
            {activeSection === "inputs" && <InputShowcase />}
            {activeSection === "selects" && <SelectShowcase />}
            {activeSection === "chips" && <ChipShowcase />}
            {activeSection === "modals" && <ModalShowcase />}
            {activeSection === "toasts" && <ToastShowcase />}
            {activeSection === "pagination" && <PaginationShowcase />}
            {activeSection === "tabs" && <TabShowcase />}
            {activeSection === "tables" && <TableShowcase />}
            {activeSection === "cards" && <CardShowcase />}
            {activeSection === "badges" && <BadgeShowcase />}
            {activeSection === "progress" && <ProgressShowcase />}
            {activeSection === "qr" && <QRScannerShowcase />}
            {activeSection === "empty" && <EmptyStateShowcase />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#00843D] to-[#006830] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-[#00843D]">N</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">NSBE UCF Design System</h2>
            <p className="text-white/90">Version 1.0.0</p>
          </div>
        </div>
        <p className="text-lg text-white/90">
          A comprehensive component library for building consistent, accessible, and
          beautiful interfaces for the NSBE UCF Event Tracker.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-3xl font-bold text-[#00843D]">15+</div>
          <div className="text-sm text-gray-600">Components</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-3xl font-bold text-[#FFD700]">50+</div>
          <div className="text-sm text-gray-600">Variants</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-3xl font-bold text-[#DC143C]">100%</div>
          <div className="text-sm text-gray-600">Responsive</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-3xl font-bold text-gray-900">WCAG AA</div>
          <div className="text-sm text-gray-600">Accessible</div>
        </div>
      </div>

      {/* Principles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Design Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00843D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-[#00843D]">✓</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Consistency</h4>
              <p className="text-sm text-gray-600">
                Uniform patterns and behaviors across all components
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#FFD700]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-[#FFD700]">♿</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Accessibility</h4>
              <p className="text-sm text-gray-600">
                WCAG AA compliant with proper ARIA labels and keyboard navigation
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600">📱</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Responsive</h4>
              <p className="text-sm text-gray-600">
                Mobile-first design that scales beautifully to any screen size
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600">⚡</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Performance</h4>
              <p className="text-sm text-gray-600">
                Optimized components with minimal re-renders and fast load times
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#00843D] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Explore Design Tokens</h4>
              <p className="text-sm text-gray-600">
                Learn about our color palette, typography scale, and spacing system
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#00843D] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Browse Components</h4>
              <p className="text-sm text-gray-600">
                Navigate through each component section to see all available variants
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#00843D] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Copy & Use</h4>
              <p className="text-sm text-gray-600">
                Each component includes usage examples and code snippets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Colors Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">NSBE Brand Colors</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="w-full h-24 bg-[#00843D] rounded-lg mb-2" />
            <p className="text-sm font-medium text-gray-900">NSBE Green</p>
            <p className="text-xs text-gray-500">#00843D</p>
          </div>
          <div>
            <div className="w-full h-24 bg-[#FFD700] rounded-lg mb-2" />
            <p className="text-sm font-medium text-gray-900">Gold</p>
            <p className="text-xs text-gray-500">#FFD700</p>
          </div>
          <div>
            <div className="w-full h-24 bg-[#DC143C] rounded-lg mb-2" />
            <p className="text-sm font-medium text-gray-900">Red</p>
            <p className="text-xs text-gray-500">#DC143C</p>
          </div>
          <div>
            <div className="w-full h-24 bg-gray-900 rounded-lg mb-2" />
            <p className="text-sm font-medium text-gray-900">Black</p>
            <p className="text-xs text-gray-500">#000000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
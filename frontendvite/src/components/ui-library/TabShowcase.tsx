import { useState } from "react";

export function TabShowcase() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSegment, setActiveSegment] = useState("all");

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tabs & Segmented Controls</h2>
        
        <div className="space-y-8">
          {/* Default Tabs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Default Tabs</h3>
            <div className="border-b border-gray-200">
              <div className="flex gap-4">
                {["overview", "details", "settings"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                      activeTab === tab
                        ? "text-[#00843D]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00843D]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">Content for {activeTab} tab</p>
            </div>
          </div>

          {/* Pill Tabs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Pill Tabs</h3>
            <div className="flex gap-2">
              {["all", "active", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? "bg-[#00843D] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Segmented Control */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Segmented Control</h3>
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              {["all", "workshops", "gbm", "service"].map((segment) => (
                <button
                  key={segment}
                  onClick={() => setActiveSegment(segment)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    activeSegment === segment
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Vertical Tabs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Vertical Tabs</h3>
            <div className="flex gap-6">
              <div className="flex flex-col gap-2 border-r border-gray-200 pr-6">
                {["profile", "account", "notifications"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm text-left transition-colors ${
                      activeTab === tab
                        ? "bg-[#00843D] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">Content for {activeTab} section</p>
              </div>
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">With Badges</h3>
            <div className="flex gap-2">
              {[
                { id: "all", label: "All", count: 24 },
                { id: "pending", label: "Pending", count: 5 },
                { id: "completed", label: "Completed", count: 19 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-[#00843D] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

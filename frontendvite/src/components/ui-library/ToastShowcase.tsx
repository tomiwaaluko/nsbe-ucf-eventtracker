import { toast } from "sonner";

export function ToastShowcase() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Toast Notifications</h2>
        
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Click the buttons below to trigger toast notifications
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => toast.success("Success!", { description: "Event created successfully" })}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-left"
            >
              <div className="font-medium">Success Toast</div>
              <div className="text-sm opacity-90">With description</div>
            </button>

            <button
              onClick={() => toast.error("Error!", { description: "Failed to create event" })}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-left"
            >
              <div className="font-medium">Error Toast</div>
              <div className="text-sm opacity-90">With description</div>
            </button>

            <button
              onClick={() => toast("Info message", { description: "This is informational" })}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left"
            >
              <div className="font-medium">Info Toast</div>
              <div className="text-sm opacity-90">Basic notification</div>
            </button>

            <button
              onClick={() => toast.success("Saved!", {})}
              className="px-4 py-3 bg-[#00843D] text-white rounded-lg hover:bg-[#006830] text-left"
            >
              <div className="font-medium">Simple Toast</div>
              <div className="text-sm opacity-90">Without description</div>
            </button>

            <button
              onClick={() => {
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: "Creating event...",
                    success: "Event created!",
                    error: "Failed to create",
                  }
                );
              }}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-left"
            >
              <div className="font-medium">Promise Toast</div>
              <div className="text-sm opacity-90">With loading state</div>
            </button>

            <button
              onClick={() => toast.success("Action complete", {
                action: {
                  label: "Undo",
                  onClick: () => toast("Undone!"),
                },
              })}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-left"
            >
              <div className="font-medium">Action Toast</div>
              <div className="text-sm opacity-90">With action button</div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Toast Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Auto-dismisses after 4 seconds (configurable)</li>
              <li>• Supports rich descriptions and action buttons</li>
              <li>• Promise-based loading states</li>
              <li>• Swipe to dismiss on mobile</li>
              <li>• Accessible with proper ARIA labels</li>
              <li>• Positioned at top-right by default</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

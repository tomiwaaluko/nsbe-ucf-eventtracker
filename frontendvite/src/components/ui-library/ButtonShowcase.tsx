import { Loader2, Plus, Download, Trash2, Settings, Heart } from "lucide-react";

export function ButtonShowcase() {
  return (
    <div className="space-y-8">
      {/* Primary Buttons */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Primary Buttons</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-3 py-1.5 text-xs bg-[#00843D] hover:bg-[#006830] text-white rounded-lg transition-colors">
                Small
              </button>
              <button className="px-4 py-2 text-sm bg-[#00843D] hover:bg-[#006830] text-white rounded-lg transition-colors">
                Default
              </button>
              <button className="px-6 py-3 text-base bg-[#00843D] hover:bg-[#006830] text-white rounded-lg transition-colors">
                Large
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">With Icons</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 text-sm bg-[#00843D] hover:bg-[#006830] text-white rounded-lg transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </button>
              <button className="px-4 py-2 text-sm bg-[#00843D] hover:bg-[#006830] text-white rounded-lg transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </button>
              <button className="px-4 py-2 text-sm bg-[#00843D] hover:bg-[#006830] text-white rounded-lg transition-colors flex items-center gap-2">
                Save
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">States</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 text-sm bg-[#00843D] hover:bg-[#006830] text-white rounded-lg transition-colors">
                Default
              </button>
              <button className="px-4 py-2 text-sm bg-[#006830] text-white rounded-lg">
                Hover
              </button>
              <button className="px-4 py-2 text-sm bg-[#00843D] text-white rounded-lg ring-2 ring-[#00843D] ring-offset-2">
                Focused
              </button>
              <button className="px-4 py-2 text-sm bg-[#00843D] text-white rounded-lg flex items-center gap-2" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading
              </button>
              <button className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed" disabled>
                Disabled
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Full Width</h3>
            <button className="w-full px-4 py-2 text-sm bg-[#00843D] hover:bg-[#006830] text-white rounded-lg transition-colors">
              Full Width Button
            </button>
          </div>
        </div>
      </section>

      {/* Secondary Buttons */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Secondary Buttons</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Outline Style</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-3 py-1.5 text-xs border-2 border-[#00843D] text-[#00843D] hover:bg-[#00843D] hover:text-white rounded-lg transition-colors">
                Small
              </button>
              <button className="px-4 py-2 text-sm border-2 border-[#00843D] text-[#00843D] hover:bg-[#00843D] hover:text-white rounded-lg transition-colors">
                Default
              </button>
              <button className="px-6 py-3 text-base border-2 border-[#00843D] text-[#00843D] hover:bg-[#00843D] hover:text-white rounded-lg transition-colors">
                Large
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">With Icons</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add
              </button>
              <button className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ghost Buttons */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ghost Buttons</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Default</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Ghost Button
              </button>
              <button className="px-4 py-2 text-sm text-[#00843D] hover:bg-[#00843D]/10 rounded-lg transition-colors">
                Green Ghost
              </button>
              <button className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Blue Ghost
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">With Icons</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Destructive Buttons */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Destructive Buttons</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Solid</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Delete
              </button>
              <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Outline</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 text-sm border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors">
                Delete
              </button>
              <button className="px-4 py-2 text-sm border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Ghost</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Delete
              </button>
              <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Icon Buttons */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Icon Buttons</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="w-8 h-8 bg-[#00843D] hover:bg-[#006830] text-white rounded-lg flex items-center justify-center transition-colors">
                <Plus className="h-4 w-4" />
              </button>
              <button className="w-10 h-10 bg-[#00843D] hover:bg-[#006830] text-white rounded-lg flex items-center justify-center transition-colors">
                <Plus className="h-5 w-5" />
              </button>
              <button className="w-12 h-12 bg-[#00843D] hover:bg-[#006830] text-white rounded-lg flex items-center justify-center transition-colors">
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Variants</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="w-10 h-10 bg-[#00843D] hover:bg-[#006830] text-white rounded-lg flex items-center justify-center transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 border-2 border-[#00843D] text-[#00843D] hover:bg-[#00843D] hover:text-white rounded-lg flex items-center justify-center transition-colors">
                <Download className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors">
                <Heart className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Rounded</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="w-10 h-10 bg-[#00843D] hover:bg-[#006830] text-white rounded-full flex items-center justify-center transition-colors">
                <Plus className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 border-2 border-[#00843D] text-[#00843D] hover:bg-[#00843D] hover:text-white rounded-full flex items-center justify-center transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Button Groups */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Groups</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Horizontal</h3>
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
              <button className="px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 border-r border-gray-300">
                Left
              </button>
              <button className="px-4 py-2 text-sm text-white bg-[#00843D] border-r border-gray-300">
                Center
              </button>
              <button className="px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50">
                Right
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">With Icons</h3>
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
              <button className="px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 border-r border-gray-300 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </button>
              <button className="px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 border-r border-gray-300 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button className="px-4 py-2 text-sm text-red-600 bg-white hover:bg-red-50 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

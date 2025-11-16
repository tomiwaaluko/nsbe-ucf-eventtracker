import { useState } from "react";
import { X, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export function ModalShowcase() {
  const [showBasic, setShowBasic] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Modal Windows</h2>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowBasic(true)}
              className="px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830]"
            >
              Basic Modal
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Confirmation Modal
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Form Modal
            </button>
          </div>

          {/* Basic Modal */}
          {showBasic && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Information</h3>
                  </div>
                  <button
                    onClick={() => setShowBasic(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  This is a basic modal window. It can contain any content you need to
                  display to the user.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowBasic(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowBasic(false)}
                    className="px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830]"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Event</h3>
                    <p className="text-gray-600">
                      Are you sure you want to delete this event? This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Create Event</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter event name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D]">
                      <option>Workshop</option>
                      <option>GBM</option>
                      <option>Community Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830]"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Static Examples */}
        <div className="mt-8 space-y-6">
          <h3 className="font-semibold text-gray-900">Modal Sizes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Small (max-w-sm)</p>
              <div className="bg-gray-100 rounded p-3 text-xs text-gray-500">384px max width</div>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Medium (max-w-md)</p>
              <div className="bg-gray-100 rounded p-3 text-xs text-gray-500">448px max width</div>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Large (max-w-lg)</p>
              <div className="bg-gray-100 rounded p-3 text-xs text-gray-500">512px max width</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

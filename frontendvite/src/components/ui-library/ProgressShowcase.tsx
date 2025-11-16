export function ProgressShowcase() {
  return (
    <div className="space-y-8">
      {/* Progress Bars */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Bars</h2>
        
        <div className="space-y-8 max-w-2xl">
          {/* Default Progress */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Default</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Workshops</span>
                  <span className="font-medium text-gray-900">66%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#00843D] h-2 rounded-full" style={{ width: "66%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">GBMs</span>
                  <span className="font-medium text-gray-900">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#00843D] h-2 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Community Service</span>
                  <span className="font-medium text-gray-900">33%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#00843D] h-2 rounded-full" style={{ width: "33%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Different Sizes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Sizes</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Small (h-1)</p>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-[#00843D] h-1 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Default (h-2)</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#00843D] h-2 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Large (h-3)</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-[#00843D] h-3 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Extra Large (h-4)</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-[#00843D] h-4 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Color Variants */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Color Variants</h3>
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#00843D] h-2 rounded-full" style={{ width: "75%" }} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "85%" }} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "40%" }} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
          </div>

          {/* With Labels Inside */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">With Labels</h3>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div
                className="bg-gradient-to-r from-[#00843D] to-[#00A651] h-8 rounded-full flex items-center justify-end pr-4"
                style={{ width: "75%" }}
              >
                <span className="text-white text-sm font-medium">75% Complete</span>
              </div>
            </div>
          </div>

          {/* Striped/Animated */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Gradient</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#00843D] via-[#00A651] to-[#FFD700] h-3 rounded-full"
                style={{ width: "66%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Progress Circles */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Circles</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Circle 1 */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                />
                <circle
                  className="text-[#00843D]"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - 0.66)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <span className="absolute text-xl font-bold text-gray-900">66%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Workshops</p>
          </div>

          {/* Circle 2 */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                />
                <circle
                  className="text-blue-500"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - 1)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <span className="absolute text-xl font-bold text-gray-900">100%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">GBMs</p>
          </div>

          {/* Circle 3 */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                />
                <circle
                  className="text-green-500"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - 0.33)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <span className="absolute text-xl font-bold text-gray-900">33%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Service</p>
          </div>

          {/* Circle 4 - Different Style */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24">
                <circle
                  className="text-gray-200"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                />
                <circle
                  className="text-purple-500"
                  strokeWidth="4"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - 0.8)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-bold text-gray-900">8</div>
                <div className="text-xs text-gray-500">/ 10</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Total Events</p>
          </div>
        </div>
      </section>
    </div>
  );
}

import { ChevronDown } from "lucide-react";

export function SelectShowcase() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Dropdowns</h2>
        
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Select</label>
            <div className="relative">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent appearance-none bg-white pr-10">
                <option>Select an option...</option>
                <option>Computer Science</option>
                <option>Electrical Engineering</option>
                <option>Mechanical Engineering</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">With Optgroups</label>
            <div className="relative">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent appearance-none bg-white pr-10">
                <option>Select event type...</option>
                <optgroup label="Academic">
                  <option>Workshop</option>
                  <option>GBM</option>
                  <option>Study Session</option>
                </optgroup>
                <optgroup label="Service">
                  <option>Community Service</option>
                  <option>Fundraiser</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disabled</label>
            <div className="relative">
              <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-gray-100 text-gray-500 cursor-not-allowed pr-10">
                <option>Disabled select</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Small Size</label>
            <div className="relative">
              <select className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent appearance-none bg-white pr-10">
                <option>Small select</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Large Size</label>
            <div className="relative">
              <select className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent appearance-none bg-white pr-10">
                <option>Large select</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

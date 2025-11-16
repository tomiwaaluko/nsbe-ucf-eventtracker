import { useState } from "react";
import { X, Check } from "lucide-react";

export function ChipShowcase() {
  const [selected, setSelected] = useState<string[]>(["workshop", "gbm"]);
  const [filterTags, setFilterTags] = useState<string[]>(["active", "upcoming"]);

  const toggleSelection = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const removeFilter = (tag: string) => {
    setFilterTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Multi-Select Chips</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Selectable Chips</h3>
            <p className="text-sm text-gray-600 mb-4">Click to select/deselect event types</p>
            <div className="flex flex-wrap gap-2">
              {["workshop", "gbm", "service", "social"].map((type) => {
                const isSelected = selected.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleSelection(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-[#00843D] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected && <Check className="inline h-4 w-4 mr-1" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-gray-500">Selected: {selected.join(", ")}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Removable Chips</h3>
            <p className="text-sm text-gray-600 mb-4">Click X to remove filters</p>
            <div className="flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  <button
                    onClick={() => removeFilter(tag)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {filterTags.length === 0 && (
                <p className="text-sm text-gray-500 italic">No filters applied</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Color Variants</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-[#00843D] text-white rounded-full text-sm font-medium">
                Green
              </span>
              <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">
                Blue
              </span>
              <span className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-medium">
                Purple
              </span>
              <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
                Red
              </span>
              <span className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-full text-sm font-medium">
                Yellow
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Outline Style</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 border-2 border-[#00843D] text-[#00843D] rounded-full text-sm font-medium">
                Green
              </span>
              <span className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-full text-sm font-medium">
                Blue
              </span>
              <span className="px-4 py-2 border-2 border-purple-500 text-purple-500 rounded-full text-sm font-medium">
                Purple
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#00843D] text-white rounded-full text-xs font-medium">
                Small
              </span>
              <span className="px-4 py-2 bg-[#00843D] text-white rounded-full text-sm font-medium">
                Default
              </span>
              <span className="px-5 py-2.5 bg-[#00843D] text-white rounded-full text-base font-medium">
                Large
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-[#00843D] text-white rounded-full text-sm font-medium inline-flex items-center gap-2">
                <Check className="h-4 w-4" />
                Selected
              </span>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium inline-flex items-center gap-2">
                Active
                <X className="h-4 w-4 hover:bg-blue-200 rounded-full cursor-pointer" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

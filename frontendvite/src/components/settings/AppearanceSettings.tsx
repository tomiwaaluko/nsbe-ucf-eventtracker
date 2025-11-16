import { useState } from "react";
import { Button } from "../ui/button";
import { Sun, Moon, Monitor, CheckCircle2, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

type Theme = "light" | "dark" | "system";
type AccentColor = "green" | "blue" | "purple" | "orange";

export function AppearanceSettings() {
  const [theme, setTheme] = useState<Theme>("light");
  const [accentColor, setAccentColor] = useState<AccentColor>("green");
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const themes = [
    {
      id: "light" as const,
      label: "Light",
      description: "Clean and bright interface",
      icon: Sun,
    },
    {
      id: "dark" as const,
      label: "Dark",
      description: "Easy on the eyes",
      icon: Moon,
    },
    {
      id: "system" as const,
      label: "System",
      description: "Match your device",
      icon: Monitor,
    },
  ];

  const accentColors = [
    {
      id: "green" as const,
      label: "NSBE Green",
      color: "#00843D",
      description: "Official NSBE brand color",
    },
    {
      id: "blue" as const,
      label: "Ocean Blue",
      color: "#0EA5E9",
      description: "Professional and calming",
    },
    {
      id: "purple" as const,
      label: "Royal Purple",
      color: "#9333EA",
      description: "Creative and vibrant",
    },
    {
      id: "orange" as const,
      label: "Energetic Orange",
      color: "#F97316",
      description: "Bold and energetic",
    },
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setHasChanges(true);
  };

  const handleAccentColorChange = (newColor: AccentColor) => {
    setAccentColor(newColor);
    setHasChanges(true);
  };

  const handleToggle = (setting: "compact" | "motion") => {
    if (setting === "compact") {
      setCompactMode(!compactMode);
    } else {
      setReducedMotion(!reducedMotion);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      toast.success("Appearance updated!", {
        description: "Your preferences have been saved successfully.",
      });
    }, 1000);
  };

  const handleReset = () => {
    setTheme("light");
    setAccentColor("green");
    setCompactMode(false);
    setReducedMotion(false);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Palette className="h-5 w-5 text-gray-600" />
          Theme
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how NSBE Event Tracker looks to you
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.id;

            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-[#00843D] bg-[#00843D]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-[#00843D]" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-[#00843D] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{themeOption.label}</h4>
                    <p className="text-xs text-gray-600">{themeOption.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Selection */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold text-gray-900 mb-1">Accent Color</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize the primary color used throughout the app
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accentColors.map((colorOption) => {
            const isSelected = accentColor === colorOption.id;

            return (
              <button
                key={colorOption.id}
                onClick={() => handleAccentColorChange(colorOption.id)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-[#00843D] bg-[#00843D]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-[#00843D]" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg shadow-sm"
                    style={{ backgroundColor: colorOption.color }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{colorOption.label}</h4>
                    <p className="text-xs text-gray-600">{colorOption.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              We recommend keeping the NSBE Green accent color for the best brand consistency.
            </span>
          </p>
        </div>
      </div>

      {/* Display Options */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Display Options</h3>

        <div className="space-y-4">
          {/* Compact Mode */}
          <div className="flex items-start justify-between bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Compact Mode</h4>
              <p className="text-sm text-gray-600">
                Reduce spacing and padding for a more condensed layout
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
              <input
                type="checkbox"
                checked={compactMode}
                onChange={() => handleToggle("compact")}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00843D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00843D]"></div>
            </label>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-start justify-between bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Reduce Motion</h4>
              <p className="text-sm text-gray-600">
                Minimize animations and transitions for a calmer experience
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={() => handleToggle("motion")}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00843D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00843D]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: accentColors.find((c) => c.id === accentColor)?.color }}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Sample Card</h4>
                <p className="text-sm text-gray-600">This is how components will look</p>
              </div>
            </div>

            <div className="space-y-2">
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: accentColors.find((c) => c.id === accentColor)?.color }}
              />
              <div
                className="h-2 rounded-full w-3/4 opacity-60"
                style={{ backgroundColor: accentColors.find((c) => c.id === accentColor)?.color }}
              />
              <div
                className="h-2 rounded-full w-1/2 opacity-40"
                style={{ backgroundColor: accentColors.find((c) => c.id === accentColor)?.color }}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: accentColors.find((c) => c.id === accentColor)?.color }}
              >
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-lg text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50">
                Secondary Button
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <span className="text-blue-600">ℹ️</span>
              You have unsaved changes
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={handleReset} disabled={isLoading}>
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#00843D] hover:bg-[#006830] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-2">Note</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Theme preferences are synced across all your devices</li>
          <li>• Dark mode is currently in preview and may have some visual bugs</li>
          <li>• Custom accent colors apply to buttons, links, and progress indicators</li>
          <li>• Reduced motion respects your system accessibility settings</li>
        </ul>
      </div>
    </div>
  );
}

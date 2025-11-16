import { useState } from "react";
import { Button } from "../ui/button";
import {
  Bell,
  Mail,
  Smartphone,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "event-reminders",
      title: "Event Reminders",
      description: "Get reminded 24 hours and 1 hour before events start",
      email: true,
      push: true,
    },
    {
      id: "new-events",
      title: "New Event Announcements",
      description: "Be notified when new events are published",
      email: true,
      push: false,
    },
    {
      id: "check-in-confirmations",
      title: "Check-In Confirmations",
      description: "Receive confirmation when you check into an event",
      email: false,
      push: true,
    },
    {
      id: "progress-updates",
      title: "Progress Updates",
      description: "Get notified when you complete 1-1-1 or 3-3-3 milestones",
      email: true,
      push: true,
    },
    {
      id: "event-cancellations",
      title: "Event Cancellations",
      description:
        "Important notifications about cancelled or rescheduled events",
      email: true,
      push: true,
    },
    {
      id: "weekly-digest",
      title: "Weekly Digest",
      description:
        "Summary of upcoming events and your activity (every Monday)",
      email: true,
      push: false,
    },
    {
      id: "announcements",
      title: "Chapter Announcements",
      description: "Important updates from NSBE UCF leadership",
      email: true,
      push: true,
    },
    {
      id: "officer-messages",
      title: "Direct Messages from Officers",
      description: "Notifications when officers send you a direct message",
      email: true,
      push: true,
    },
  ]);

  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (id: string, type: "email" | "push") => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, [type]: !pref[type] } : pref
      )
    );
    setHasChanges(true);
  };

  const handleToggleAll = (type: "email" | "push", value: boolean) => {
    setPreferences((prev) => prev.map((pref) => ({ ...pref, [type]: value })));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      toast.success("Preferences saved!", {
        description: "Your notification preferences have been updated.",
      });
    }, 1000);
  };

  const handleReset = () => {
    // Reset to default state
    setPreferences([
      {
        id: "event-reminders",
        title: "Event Reminders",
        description: "Get reminded 24 hours and 1 hour before events start",
        email: true,
        push: true,
      },
      {
        id: "new-events",
        title: "New Event Announcements",
        description: "Be notified when new events are published",
        email: true,
        push: false,
      },
      {
        id: "check-in-confirmations",
        title: "Check-In Confirmations",
        description: "Receive confirmation when you check into an event",
        email: false,
        push: true,
      },
      {
        id: "progress-updates",
        title: "Progress Updates",
        description: "Get notified when you complete 1-1-1 or 3-3-3 milestones",
        email: true,
        push: true,
      },
      {
        id: "event-cancellations",
        title: "Event Cancellations",
        description:
          "Important notifications about cancelled or rescheduled events",
        email: true,
        push: true,
      },
      {
        id: "weekly-digest",
        title: "Weekly Digest",
        description:
          "Summary of upcoming events and your activity (every Monday)",
        email: true,
        push: false,
      },
      {
        id: "announcements",
        title: "Chapter Announcements",
        description: "Important updates from NSBE UCF leadership",
        email: true,
        push: true,
      },
      {
        id: "officer-messages",
        title: "Direct Messages from Officers",
        description: "Notifications when officers send you a direct message",
        email: true,
        push: true,
      },
    ]);
    setHasChanges(false);
  };

  const emailCount = preferences.filter((p) => p.email).length;
  const pushCount = preferences.filter((p) => p.push).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#00843D]/10 to-[#00843D]/5 rounded-lg p-4 border border-[#00843D]/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#00843D] rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{emailCount}/8</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              handleToggleAll("email", emailCount !== preferences.length)
            }
            className="text-xs"
          >
            {emailCount === preferences.length ? "Disable All" : "Enable All"}
          </Button>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Push Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{pushCount}/8</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              handleToggleAll("push", pushCount !== preferences.length)
            }
            className="text-xs"
          >
            {pushCount === preferences.length ? "Disable All" : "Enable All"}
          </Button>
        </div>
      </div>

      {/* Notification Preferences Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Notification Type
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 w-32">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 w-32">
                <div className="flex items-center justify-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Push
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {preferences.map((pref) => (
              <tr
                key={pref.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{pref.title}</p>
                    <p className="text-sm text-gray-600">{pref.description}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.email}
                      onChange={() => handleToggle(pref.id, "email")}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00843D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00843D]"></div>
                  </label>
                </td>
                <td className="py-4 px-4 text-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.push}
                      onChange={() => handleToggle(pref.id, "push")}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notification Preferences Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {preferences.map((pref) => (
          <div
            key={pref.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <h4 className="font-medium text-gray-900 mb-1">{pref.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{pref.description}</p>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={pref.email}
                  onChange={() => handleToggle(pref.id, "email")}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00843D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00843D]"></div>
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={pref.push}
                  onChange={() => handleToggle(pref.id, "push")}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  Push
                </span>
              </label>
            </div>
          </div>
        ))}
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
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#00843D] hover:bg-[#006830] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          About Notifications
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Email notifications are sent to your registered email</li>
          <li>• Push notifications require browser permission</li>
          <li>
            • Critical notifications (like event cancellations) cannot be
            disabled
          </li>
          <li>• You can update these preferences anytime</li>
        </ul>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  AlertTriangle,
  Loader2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

interface AccountSettingsProps {
  memberData: {
    email: string;
    id?: string;
    hasPassword?: boolean;
  };
}

export function AccountSettings({ memberData }: AccountSettingsProps) {
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Must contain a lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Must contain an uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Must contain a number";
    return "";
  };

  const handlePasswordChange = async () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    const newPasswordError = validatePassword(passwordData.newPassword);
    if (newPasswordError) {
      newErrors.newPassword = newPasswordError;
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors", {
        description: "Check the form for validation errors.",
      });
      return;
    }

    if (!memberData.email) {
      toast.error("Email required", { description: "Could not determine your email." });
      return;
    }

    setIsLoading(true);

    try {
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: memberData.email,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        setErrors({ currentPassword: "Current password is incorrect" });
        toast.error("Invalid password", {
          description: "The current password you entered is incorrect.",
        });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) {
        toast.error("Failed to update password", {
          description: updateError.message,
        });
        return;
      }

      setShowChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      toast.success("Password changed!", {
        description: "Your password has been updated successfully.",
      });
    } catch (err: any) {
      toast.error("Something went wrong", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Confirmation required", {
        description: 'Please type "DELETE" to confirm.',
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not signed in", { description: "Please sign in and try again." });
      return;
    }

    setIsLoading(true);

    try {
      await api.deleteAccount(token);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
      toast.success("Account deleted", {
        description: "Your account has been permanently deleted.",
      });
      router.push("/");
    } catch (err: any) {
      toast.error("Failed to delete account", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&#])/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-[#00843D]",
    "bg-[#00843D]",
  ];

  const canChangePassword = memberData.hasPassword !== false;

  return (
    <div className="space-y-6">
      {/* Change Password Section - only for users with password auth */}
      {canChangePassword && (
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-600" />
              Password
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Update your password to keep your account secure
            </p>
          </div>
          {!showChangePassword && (
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(true)}
              className="flex-shrink-0"
            >
              Change Password
            </Button>
          )}
        </div>

        {showChangePassword && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className={`pr-10 ${errors.currentPassword ? "border-red-500" : ""}`}
                  aria-invalid={!!errors.currentPassword}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-600">⚠ {errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className={`pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
                  aria-invalid={!!errors.newPassword}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength >= level
                            ? strengthColors[passwordStrength]
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Strength: <span className="font-medium">{strengthLabels[passwordStrength]}</span>
                  </p>
                </div>
              )}

              {errors.newPassword && (
                <p className="text-sm text-red-600">⚠ {errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">⚠ {errors.confirmPassword}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setErrors({});
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="bg-[#00843D] hover:bg-[#006830] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Two-Factor Authentication Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Smartphone className="h-3 w-3" />
              Coming Soon
            </span>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-700 mb-3">
            Two-factor authentication (2FA) adds an extra layer of security by requiring a
            verification code in addition to your password when signing in.
          </p>
          <Button variant="outline" disabled className="opacity-50">
            <Shield className="h-4 w-4" />
            Enable 2FA
          </Button>
        </div>
      </div>

      {/* Active Sessions Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Active Sessions</h3>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">Current Session</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">Chrome on macOS</p>
                <p className="text-xs text-gray-500 mt-1">
                  Orlando, FL • Last active: Just now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Danger Zone</h3>
              <p className="text-sm text-red-800 mb-4">
                Once you delete your account, there is no going back. This will permanently
                delete your profile, attendance history, and all associated data.
              </p>

              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-4 bg-white rounded-lg p-4 border border-red-300">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Are you absolutely sure?
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">DELETE</span> to confirm:
                    </p>
                    <Input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                      className="max-w-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={isLoading || deleteConfirmText !== "DELETE"}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4" />
                          Delete My Account
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

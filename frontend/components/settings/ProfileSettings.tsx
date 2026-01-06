import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, Upload, X, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileSettingsProps {
  memberData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    major?: string;
    graduationYear?: number;
    profilePhoto?: string;
  };
}

const MAJORS = [
  "Aerospace Engineering",
  "Biomedical Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science",
  "Electrical Engineering",
  "Environmental Engineering",
  "Industrial Engineering",
  "Mechanical Engineering",
  "Other",
];

const GRADUATION_YEARS = Array.from(
  { length: 8 },
  (_, i) => new Date().getFullYear() + i
);

export function ProfileSettings({ memberData }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    firstName: memberData.firstName,
    lastName: memberData.lastName,
    email: memberData.email,
    major: memberData.major || "",
    graduationYear: memberData.graduationYear || "",
  });
  const [profilePhoto, setProfilePhoto] = useState(
    memberData.profilePhoto || ""
  );
  const [previewUrl, setPreviewUrl] = useState(memberData.profilePhoto || "");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", {
        description: "Please choose an image smaller than 5MB.",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please choose an image file.",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreviewUrl("");
    setProfilePhoto("");
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors", {
        description: "Check the form for validation errors.",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      toast.success("Profile updated!", {
        description: "Your profile information has been saved successfully.",
      });
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email,
      major: memberData.major || "",
      graduationYear: memberData.graduationYear || "",
    });
    setPreviewUrl(memberData.profilePhoto || "");
    setHasChanges(false);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Section */}
      <div>
        <h3 className="font-extrabold text-black text-xl mb-4">Profile Photo</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            {previewUrl ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {previewUrl ? "Change Photo" : "Upload Photo"}
              </Button>
              {previewUrl && (
                <Button variant="ghost" onClick={handleRemovePhoto}>
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-black/70 font-medium mt-2">
              JPG, PNG or GIF. Max size 5MB. Recommended 400x400px.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-extrabold text-black text-xl mb-4">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-bold text-black">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={errors.firstName ? "border-red-500" : ""}
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">⚠ {errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-bold text-black">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className={errors.lastName ? "border-red-500" : ""}
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">⚠ {errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email" className="font-bold text-black">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-600 font-semibold">⚠ {errors.email}</p>
            )}
            <p className="text-xs text-black/70 font-medium">
              This email is used for account recovery and notifications
            </p>
          </div>

          {/* Major */}
          <div className="space-y-2">
            <Label htmlFor="major" className="font-bold text-black">Major</Label>
            <select
              id="major"
              value={formData.major}
              onChange={(e) => handleChange("major", e.target.value)}
              className="flex h-9 w-full rounded-md border-2 border-black bg-white px-3 py-1 text-sm font-medium text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <option value="" className="text-black/60">Select your major</option>
              {MAJORS.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          {/* Graduation Year */}
          <div className="space-y-2">
            <Label htmlFor="graduationYear" className="font-bold text-black">Expected Graduation</Label>
            <select
              id="graduationYear"
              value={formData.graduationYear}
              onChange={(e) =>
                handleChange("graduationYear", parseInt(e.target.value))
              }
              className="flex h-9 w-full rounded-md border-2 border-black bg-white px-3 py-1 text-sm font-medium text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <option value="" className="text-black/60">Select year</option>
              {GRADUATION_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-2">
          Why we need this information
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            • Your name appears on event attendance records and certificates
          </li>
          <li>• Email is used for event notifications and account recovery</li>
          <li>
            • Major and graduation year help us tailor events to your interests
          </li>
          <li>• Profile photo personalizes your dashboard experience</li>
        </ul>
      </div>
    </div>
  );
}

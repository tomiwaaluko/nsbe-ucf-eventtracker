import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { User, Upload, X, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, apiHeaders } from "@/lib/api";

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
    firstName: memberData.firstName || "",
    lastName: memberData.lastName || "",
    email: memberData.email || "",
    major: "",
    graduationYear: "",
    phoneNumber: "",
    linkedInUrl: "",
    bio: "",
    discordUsername: "",
  });
  const [profilePhoto, setProfilePhoto] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch member data on mount
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/members/me`, {
          headers: apiHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            major: data.major || "",
            graduationYear: data.graduationYear || "",
            phoneNumber: data.phoneNumber || "",
            linkedInUrl: data.linkedInUrl || "",
            bio: data.bio || "",
            discordUsername: data.discordUsername || "",
          });
          setProfilePhoto(data.photoUrl || "");
          setPreviewUrl(data.photoUrl || "");
        }
      } catch (error) {
        console.error('Failed to fetch member data:', error);
      }
    };

    fetchMemberData();
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      toast.error("Invalid file type", {
        description: "Please choose a JPEG, PNG, or WebP image.",
      });
      return;
    }

    // Upload to server
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${getApiUrl()}/members/me/photo`, {
        method: 'POST',
        headers: apiHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPreviewUrl(data.photoUrl);
      setProfilePhoto(data.photoUrl);

      toast.success("Photo uploaded!", {
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Upload failed", {
        description: "Failed to upload photo. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/members/me/photo`, {
        method: 'DELETE',
        headers: apiHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setPreviewUrl("");
      setProfilePhoto("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Photo deleted!", {
        description: "Your profile photo has been removed.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Delete failed", {
        description: "Failed to delete photo. Please try again.",
      });
    } finally {
      setIsLoading(false);
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

    if (formData.linkedInUrl && !/^https?:\/\/.+/.test(formData.linkedInUrl)) {
      newErrors.linkedInUrl = "Please enter a valid URL";
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

    try {
      const response = await fetch(`${getApiUrl()}/members/me`, {
        method: 'PUT',
        headers: apiHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }),
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          major: formData.major || undefined,
          graduationYear: formData.graduationYear ? parseInt(formData.graduationYear as string) : undefined,
          phoneNumber: formData.phoneNumber || undefined,
          linkedInUrl: formData.linkedInUrl || undefined,
          bio: formData.bio || undefined,
          discordUsername: formData.discordUsername || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      setHasChanges(false);
      toast.success("Profile updated!", {
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Save failed", {
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to last saved values
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Section */}
      <div>
        <h3 className="font-extrabold text-white text-xl mb-4">Profile Photo</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            {previewUrl ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
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
              <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center border-2 border-dashed border-white/20">
                <User className="h-12 w-12 text-white/30" />
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
            <p className="text-xs text-white/60 font-medium mt-2">
              JPG, PNG or GIF. Max size 5MB. Recommended 400x400px.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <h3 className="font-extrabold text-white text-xl mb-4">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-bold text-white">
              First Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={`bg-[#1a1a1a] border-white/20 text-white placeholder:text-white/30 ${errors.firstName ? "border-red-400" : ""}`}
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <p className="text-sm text-red-400">⚠ {errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-bold text-white">
              Last Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className={`bg-[#1a1a1a] border-white/20 text-white placeholder:text-white/30 ${errors.lastName ? "border-red-400" : ""}`}
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="text-sm text-red-400">⚠ {errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email" className="font-bold text-white">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-[#0a0a0a] border-white/10 text-white/50"
            />
            <p className="text-xs text-white/50 font-medium">
              Email cannot be changed
            </p>
          </div>

          {/* Major */}
          <div className="space-y-2">
            <Label htmlFor="major" className="font-bold text-white">Major</Label>
            <select
              id="major"
              value={formData.major}
              onChange={(e) => handleChange("major", e.target.value)}
              className="flex h-9 w-full rounded-md border border-white/20 bg-[#1a1a1a] px-3 py-1 text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a651]"
            >
              <option value="" className="text-white/60 bg-[#1a1a1a]">Select your major</option>
              {MAJORS.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          {/* Graduation Year */}
          <div className="space-y-2">
            <Label htmlFor="graduationYear" className="font-bold text-white">Expected Graduation</Label>
            <select
              id="graduationYear"
              value={formData.graduationYear}
              onChange={(e) =>
                handleChange("graduationYear", e.target.value)
              }
              className="flex h-9 w-full rounded-md border border-white/20 bg-[#1a1a1a] px-3 py-1 text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a651]"
            >
              <option value="" className="text-white/60 bg-[#1a1a1a]">Select year</option>
              {GRADUATION_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio" className="font-bold text-white">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={500}
              className="resize-none bg-[#1a1a1a] border-white/20 text-white placeholder:text-white/30"
              rows={4}
            />
            <p className="text-xs text-white/50 font-medium">
              {formData.bio?.length || 0}/500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="font-extrabold text-white text-xl mb-4">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="font-bold text-white">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="(123) 456-7890"
              className="bg-[#1a1a1a] border-white/20 text-white placeholder:text-white/30"
            />
          </div>

          {/* Discord Username */}
          <div className="space-y-2">
            <Label htmlFor="discordUsername" className="font-bold text-white">Discord Username</Label>
            <Input
              id="discordUsername"
              type="text"
              value={formData.discordUsername}
              onChange={(e) => handleChange("discordUsername", e.target.value)}
              placeholder="username#1234"
              className="bg-[#1a1a1a] border-white/20 text-white placeholder:text-white/30"
            />
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="linkedInUrl" className="font-bold text-white">LinkedIn Profile</Label>
            <Input
              id="linkedInUrl"
              type="url"
              value={formData.linkedInUrl}
              onChange={(e) => handleChange("linkedInUrl", e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className={`bg-[#1a1a1a] border-white/20 text-white placeholder:text-white/30 ${errors.linkedInUrl ? "border-red-400" : ""}`}
            />
            {errors.linkedInUrl && (
              <p className="text-sm text-red-400">⚠ {errors.linkedInUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="border-t border-white/10 pt-6">
          <div className="bg-[#00a651]/10 border border-[#00a651]/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-[#00a651] flex items-center gap-2">
              <span className="text-[#00a651]">ℹ️</span>
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
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
        <h4 className="font-semibold text-white text-sm mb-2">
          Why we need this information
        </h4>
        <ul className="text-xs text-white/60 space-y-1">
          <li>
            • Your name appears on event attendance records and certificates
          </li>
          <li>• Email is used for event notifications and account recovery</li>
          <li>
            • Major and graduation year help us tailor events to your interests
          </li>
          <li>• Profile photo personalizes your dashboard experience</li>
          <li>• Contact info helps other members and officers connect with you</li>
        </ul>
      </div>
    </div>
  );
}

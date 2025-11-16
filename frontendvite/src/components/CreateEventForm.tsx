import { useState } from "react";
import { Calendar, MapPin, Users, Clock, FileText, Hash } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";

interface CreateEventFormProps {
  onSubmit: (eventData: any) => void;
  onCancel: () => void;
}

export function CreateEventForm({ onSubmit, onCancel }: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventType: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    qrSecret: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.eventType) {
      newErrors.eventType = "Event type is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }
    if (!formData.qrSecret.trim()) {
      newErrors.qrSecret = "QR secret is required";
    }

    // Validate end time is after start time
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        capacity: parseInt(formData.capacity),
      });
    }
  };

  const generateQRSecret = () => {
    const secret = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    handleChange("qrSecret", secret);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Create New Event</h2>
        <p className="text-gray-600 mt-1">
          Fill in the details to create a new NSBE event
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            {/* Event Name */}
            <div>
              <Label htmlFor="name">
                Event Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Resume Building Workshop"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the event..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className={`mt-1 ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <Label htmlFor="eventType">
                Event Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => handleChange("eventType", value)}
              >
                <SelectTrigger
                  className={`mt-1 ${errors.eventType ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WORKSHOP">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ffb81c]" />
                      <span>Workshop (Social/AEX)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="GBM">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#00a651]" />
                      <span>General Body Meeting</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="COMMUNITY_SERVICE">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ed1c24]" />
                      <span>Community Service</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.eventType && (
                <p className="text-xs text-red-500 mt-1">{errors.eventType}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Date & Time */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Date & Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={`pl-10 ${errors.date ? "border-red-500" : ""}`}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <Label htmlFor="startTime">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  className={`pl-10 ${errors.startTime ? "border-red-500" : ""}`}
                />
              </div>
              {errors.startTime && (
                <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <Label htmlFor="endTime">
                End Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  className={`pl-10 ${errors.endTime ? "border-red-500" : ""}`}
                />
              </div>
              {errors.endTime && (
                <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Location & Capacity */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Location & Capacity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Engineering Building Room 101"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-red-500 mt-1">{errors.location}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <Label htmlFor="capacity">
                Capacity <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g., 50"
                  value={formData.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  className={`pl-10 ${errors.capacity ? "border-red-500" : ""}`}
                />
              </div>
              {errors.capacity && (
                <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Check-In Settings */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Check-In Settings</h3>
          <div className="space-y-4">
            {/* QR Secret */}
            <div>
              <Label htmlFor="qrSecret">
                QR Code Secret <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="qrSecret"
                    type="text"
                    placeholder="Enter or generate a unique secret"
                    value={formData.qrSecret}
                    onChange={(e) => handleChange("qrSecret", e.target.value)}
                    className={`pl-10 ${errors.qrSecret ? "border-red-500" : ""}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateQRSecret}
                >
                  Generate
                </Button>
              </div>
              {errors.qrSecret && (
                <p className="text-xs text-red-500 mt-1">{errors.qrSecret}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                This secret will be encoded in the QR code for check-in
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="w-4 h-4 text-[#00a651] border-gray-300 rounded focus:ring-[#00a651]"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Event is active (members can check in)
              </Label>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#00a651] hover:bg-[#008a44] text-white"
          >
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}

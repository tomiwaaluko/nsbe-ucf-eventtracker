import { useState } from "react";
import { Calendar, MapPin, Clock, FileText } from "lucide-react";
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
import { EVENT_CATEGORIES, EventCategory } from "@/lib/constants/event-categories";
import { generateSemesterOptions, getCurrentSemester } from "@/lib/utils/semesters";

interface CreateEventFormProps {
  onSubmit: (eventData: any) => void;
  onCancel: () => void;
}

export function CreateEventForm({ onSubmit, onCancel }: CreateEventFormProps) {
  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "" as EventCategory | "",
    semester: getCurrentSemester(),
    date: getTodayDate(),
    startTime: "",
    endTime: "",
    location: "",
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
    if (!formData.category) {
      newErrors.category = "Event category is required";
    }
    if (!formData.semester) {
      newErrors.semester = "Semester is required";
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
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Event</h2>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Fill in the details to create a new NSBE event
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Basic Information */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4 md:space-y-5">
            {/* Event Name */}
            <div>
              <Label htmlFor="name" className="text-base md:text-sm">
                Event Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Resume Building Workshop"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`pl-11 md:pl-10 h-12 md:h-10 text-base ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base md:text-sm">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the event..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className={`mt-2 text-base min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Event Category */}
            <div>
              <Label htmlFor="category" className="text-base md:text-sm">
                Event Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value as EventCategory)}
              >
                <SelectTrigger
                  className={`mt-2 h-12 md:h-10 text-base ${errors.category ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select event category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="py-3 md:py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 md:w-3 md:h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-base md:text-sm">{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Semester */}
            <div>
              <Label htmlFor="semester" className="text-base md:text-sm">
                Semester <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => handleChange("semester", value)}
              >
                <SelectTrigger
                  className={`mt-2 h-12 md:h-10 text-base ${errors.semester ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {generateSemesterOptions().map((semester) => (
                    <SelectItem key={semester} value={semester} className="py-3 md:py-2 text-base md:text-sm">
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.semester && (
                <p className="text-sm text-red-500 mt-1">{errors.semester}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Date & Time */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Date & Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="date" className="text-base md:text-sm">
                Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={`pl-11 md:pl-10 h-12 md:h-10 text-base ${errors.date ? "border-red-500" : ""}`}
                />
              </div>
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <Label htmlFor="startTime" className="text-base md:text-sm">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  className={`pl-11 md:pl-10 h-12 md:h-10 text-base ${errors.startTime ? "border-red-500" : ""}`}
                />
              </div>
              {errors.startTime && (
                <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <Label htmlFor="endTime" className="text-base md:text-sm">
                End Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  className={`pl-11 md:pl-10 h-12 md:h-10 text-base ${errors.endTime ? "border-red-500" : ""}`}
                />
              </div>
              {errors.endTime && (
                <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Location</h3>
          <div>
            <Label htmlFor="location" className="text-base md:text-sm">
              Location <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
              <Input
                id="location"
                type="text"
                placeholder="e.g., Engineering Building Room 101"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={`pl-11 md:pl-10 h-12 md:h-10 text-base ${errors.location ? "border-red-500" : ""}`}
              />
            </div>
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location}</p>
            )}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-12 md:h-10 text-base md:text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#00a651] hover:bg-[#008a44] text-white h-12 md:h-10 text-base md:text-sm font-semibold"
          >
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import { Calendar, MapPin, Clock, FileText, Save } from "lucide-react";
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
import { EVENT_CATEGORIES, EventCategory } from "@/lib/constants/event-categories";
import { generateSemesterOptions } from "@/lib/utils/semesters";

interface Event {
  id: string;
  name: string;
  description: string | null;
  category: EventCategory;
  semester: string;
  date: string; // YYYY-MM-DD format (already transformed)
  startTime: string; // HH:MM format (already transformed)
  endTime: string; // HH:MM format (already transformed)
  location: string | null;
}

interface EditEventFormProps {
  event: Event;
  onSubmit: (eventData: any) => void;
  onCancel: () => void;
}

export function EditEventForm({ event, onSubmit, onCancel }: EditEventFormProps) {
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description || "",
    category: event.category,
    semester: event.semester,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location || "",
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
      onSubmit({
        id: event.id,
        ...formData,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white font-extrabold uppercase tracking-tight">Edit Event</h2>
        <p className="text-white/70 mt-1 font-medium">
          Update event details for {event.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-black font-extrabold uppercase tracking-wide mb-4">Basic Information</h3>
          <div className="space-y-4">
            {/* Event Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-bold text-black uppercase tracking-wide">
                Event Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Resume Building Workshop"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`pl-10 bg-black/5 border-2 border-black focus:border-[#00a651] font-medium text-black placeholder:text-black/40 rounded-none ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-bold text-black uppercase tracking-wide">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the event..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className={`mt-1 bg-black/5 border-2 border-black focus:border-[#00a651] font-medium text-black placeholder:text-black/40 rounded-none resize-none ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Event Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-bold text-black uppercase tracking-wide">
                Event Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value as EventCategory)}
              >
                <SelectTrigger
                  className={`mt-1 bg-black/5 border-2 border-black font-medium text-black rounded-none ${errors.category ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select event category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Semester */}
            <div>
              <Label htmlFor="semester" className="text-sm font-bold text-black uppercase tracking-wide">
                Semester <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => handleChange("semester", value)}
              >
                <SelectTrigger
                  className={`mt-1 bg-black/5 border-2 border-black font-medium text-black rounded-none ${errors.semester ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {generateSemesterOptions().map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.semester && (
                <p className="text-xs text-red-500 mt-1">{errors.semester}</p>
              )}
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-black font-extrabold uppercase tracking-wide mb-4">Date & Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="date" className="text-sm font-bold text-black uppercase tracking-wide">
                Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={`pl-10 bg-black/5 border-2 border-black focus:border-[#00a651] font-medium text-black rounded-none ${errors.date ? "border-red-500" : ""}`}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <Label htmlFor="startTime" className="text-sm font-bold text-black uppercase tracking-wide">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  className={`pl-10 bg-black/5 border-2 border-black focus:border-[#00a651] font-medium text-black rounded-none ${errors.startTime ? "border-red-500" : ""}`}
                />
              </div>
              {errors.startTime && (
                <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <Label htmlFor="endTime" className="text-sm font-bold text-black uppercase tracking-wide">
                End Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  className={`pl-10 bg-black/5 border-2 border-black focus:border-[#00a651] font-medium text-black rounded-none ${errors.endTime ? "border-red-500" : ""}`}
                />
              </div>
              {errors.endTime && (
                <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-black font-extrabold uppercase tracking-wide mb-4">Location</h3>
          <div>
            <Label htmlFor="location" className="text-sm font-bold text-black uppercase tracking-wide">
              Location <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
              <Input
                id="location"
                type="text"
                placeholder="e.g., Engineering Building Room 101"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={`pl-10 bg-black/5 border-2 border-black focus:border-[#00a651] font-medium text-black placeholder:text-black/40 rounded-none ${errors.location ? "border-red-500" : ""}`}
              />
            </div>
            {errors.location && (
              <p className="text-xs text-red-500 mt-1">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            onClick={onCancel}
            className="bg-white text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wider hover:bg-black/5 rounded-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#00a651] hover:bg-[#008a44] text-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold uppercase tracking-wider rounded-none"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

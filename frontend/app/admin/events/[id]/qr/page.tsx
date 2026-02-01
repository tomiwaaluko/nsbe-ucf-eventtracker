"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventQRDisplay } from "@/components/EventQRDisplay";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { EventCategory } from "@/lib/constants/event-categories";

interface Event {
  id: string;
  name: string;
  description?: string;
  category: EventCategory;
  startTime: Date | string;
  endTime: Date | string;
  location?: string;
  isActive: boolean;
}

export default function EventQRPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/");
      return;
    }
    setToken(storedToken);
    loadEvent(storedToken);
  }, [params.id]);

  const loadEvent = async (authToken: string) => {
    try {
      setIsLoading(true);
      const eventData = await api.getEvent(authToken, params.id as string);
      setEvent(eventData);
    } catch (error) {
      console.error("Failed to load event:", error);
      toast.error("Failed to load event");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.push("/admin/events");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="bg-white rounded-lg p-8">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={goBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">Event not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        <EventQRDisplay event={event} token={token} />
      </div>
    </div>
  );
}

import { Badge } from "./ui/badge";
import { Calendar, Clock, Tag } from "lucide-react";

interface AttendanceRecord {
  id: string;
  eventName: string;
  eventCategory: "COMMUNITY_SERVICE" | "GBM" | "SOCIAL_AEX";
  checkedInAt: Date;
  checkInMethod: "qr" | "manual" | "exception";
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

const categoryConfig = {
  COMMUNITY_SERVICE: {
    label: "Community Service",
    color: "bg-red-100 text-red-700",
  },
  GBM: {
    label: "GBM",
    color: "bg-green-100 text-green-700",
  },
  SOCIAL_AEX: {
    label: "Workshop",
    color: "bg-yellow-100 text-yellow-700",
  },
};

const methodConfig = {
  qr: { label: "QR Code", color: "bg-blue-100 text-blue-700" },
  manual: { label: "Manual", color: "bg-purple-100 text-purple-700" },
  exception: { label: "Exception", color: "bg-orange-100 text-orange-700" },
};

export function AttendanceTable({ records }: AttendanceTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No attendance records yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Check in to events to see your history here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Method
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => {
              const categoryStyle = categoryConfig[record.eventCategory];
              const methodStyle = methodConfig[record.checkInMethod];

              return (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{record.eventName}</td>
                  <td className="px-6 py-4">
                    <Badge className={categoryStyle.color}>
                      {categoryStyle.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(record.checkedInAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatTime(record.checkedInAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={methodStyle.color} variant="outline">
                      {methodStyle.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden divide-y divide-gray-200">
        {records.map((record) => {
          const categoryStyle = categoryConfig[record.eventCategory];
          const methodStyle = methodConfig[record.checkInMethod];

          return (
            <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-gray-900">{record.eventName}</h5>
                <Badge className={categoryStyle.color} variant="outline">
                  {categoryStyle.label}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(record.checkedInAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{formatTime(record.checkedInAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <Badge className={methodStyle.color} variant="outline">
                    {methodStyle.label}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

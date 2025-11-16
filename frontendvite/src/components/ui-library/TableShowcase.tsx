export function TableShowcase() {
  const events = [
    { id: 1, name: "Fall GBM #1", type: "GBM", date: "Nov 20, 2024", attendees: 45, status: "Active" },
    { id: 2, name: "Resume Workshop", type: "Workshop", date: "Nov 22, 2024", attendees: 30, status: "Active" },
    { id: 3, name: "Food Drive", type: "Service", date: "Dec 5, 2024", attendees: 25, status: "Upcoming" },
    { id: 4, name: "Networking Mixer", type: "Workshop", date: "Dec 10, 2024", attendees: 40, status: "Upcoming" },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Tables</h2>
        
        <div className="space-y-8">
          {/* Basic Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Basic Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Event</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Attendees</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{event.name}</td>
                      <td className="py-3 px-4 text-gray-700">{event.type}</td>
                      <td className="py-3 px-4 text-gray-700">{event.date}</td>
                      <td className="py-3 px-4 text-center text-gray-700">{event.attendees}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Striped Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Striped Rows</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Event</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Attendees</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <tr key={event.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 font-medium text-gray-900">{event.name}</td>
                      <td className="py-3 px-4 text-gray-700">{event.type}</td>
                      <td className="py-3 px-4 text-center text-gray-700">{event.attendees}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compact Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Compact</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Event</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Type</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-900">Attendees</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm text-gray-900">{event.name}</td>
                      <td className="py-2 px-3 text-sm text-gray-700">{event.type}</td>
                      <td className="py-2 px-3 text-center text-sm text-gray-700">{event.attendees}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

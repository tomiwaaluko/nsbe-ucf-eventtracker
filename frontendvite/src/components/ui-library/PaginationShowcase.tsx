import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function PaginationShowcase() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pagination</h2>
        
        <div className="space-y-8">
          {/* Default Pagination */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Default</h3>
            <div className="flex items-center justify-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-[#00843D] text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* With First/Last */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">With First/Last</h3>
            <div className="flex items-center justify-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {[1, 2, 3, "...", totalPages].map((page, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === "..."
                      ? "cursor-default"
                      : currentPage === page
                      ? "bg-[#00843D] text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ChevronRight className="h-5 w-5" />
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Compact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Compact</h3>
            <div className="flex items-center justify-center gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Previous
              </button>
              <span className="px-4 py-1.5 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>

          {/* With Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">With Info</h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">Showing 1-10 of 100 results</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-[#00843D] text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Simple Arrows */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Simple Arrows</h3>
            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830]">
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830]">
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

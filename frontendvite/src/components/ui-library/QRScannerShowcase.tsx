import { QrCode, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function QRScannerShowcase() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">QR Scanner Container</h2>
        
        <div className="space-y-8">
          {/* Default Scanner */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Default Scanner</h3>
            <div className="max-w-md mx-auto">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-square">
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-white/20" />
                </div>
                
                {/* Scanning Animation */}
                <div className="absolute inset-4 border-4 border-[#00843D] rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                </div>

                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[#00843D] opacity-50" />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-gray-700 font-medium mb-2">Position QR code in frame</p>
                <p className="text-sm text-gray-500">Scanner will detect automatically</p>
              </div>
            </div>
          </div>

          {/* Success State */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Success State</h3>
            <div className="max-w-md mx-auto">
              <div className="relative bg-green-50 border-2 border-green-500 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Check-In Successful!</h4>
                  <p className="text-sm text-gray-600">Fall GBM #4</p>
                  <p className="text-sm text-gray-500 mt-1">Nov 20, 2024 at 6:15 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Error State</h3>
            <div className="max-w-md mx-auto">
              <div className="relative bg-red-50 border-2 border-red-500 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Invalid QR Code</h4>
                  <p className="text-sm text-gray-600">This code is not valid for check-in</p>
                  <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Loading State</h3>
            <div className="max-w-md mx-auto">
              <div className="relative bg-blue-50 border-2 border-blue-500 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">Verifying...</h4>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Scanner */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Compact Version</h3>
            <div className="max-w-sm mx-auto">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-16 w-16 text-white/20" />
                </div>
                
                <div className="absolute inset-4 border-2 border-[#00843D] rounded">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-3">Compact scanner for quick check-ins</p>
            </div>
          </div>

          {/* With Controls */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">With Controls</h3>
            <div className="max-w-md mx-auto">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-square">
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-white/20" />
                </div>
                
                <div className="absolute inset-4 border-4 border-[#00843D] rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                </div>

                {/* Control Buttons */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  <button className="px-4 py-2 bg-white/90 text-gray-900 rounded-lg text-sm font-medium hover:bg-white">
                    Switch Camera
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

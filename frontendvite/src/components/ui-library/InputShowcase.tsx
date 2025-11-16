import { useState } from "react";
import { Mail, Lock, Search, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export function InputShowcase() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8">
      {/* Text Inputs */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Text Inputs</h2>
        
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default</label>
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">With Icon (Left)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Your name"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">With Icon (Right)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disabled</label>
            <input
              type="text"
              placeholder="Disabled input"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Read Only</label>
            <input
              type="text"
              value="john.doe@ucf.edu"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
        </div>
      </section>

      {/* Email & Password */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Email & Password</h2>
        
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="john.doe@ucf.edu"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Input States */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Input States</h2>
        
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Error State</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Invalid input"
                className="w-full px-3 py-2 border-2 border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
            </div>
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> This field is required
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Success State</label>
            <div className="relative">
              <input
                type="email"
                value="john.doe@ucf.edu"
                className="w-full px-3 py-2 border-2 border-[#10B981] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
              />
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#10B981]" />
            </div>
            <p className="mt-1 text-sm text-[#10B981] flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Valid email address
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warning State</label>
            <div className="relative">
              <input
                type="text"
                value="Password123"
                className="w-full px-3 py-2 border-2 border-yellow-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              />
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-500" />
            </div>
            <p className="mt-1 text-sm text-yellow-700 flex items-center gap-1">
              <span>⚠</span> Password strength: Weak
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">With Helper Text</label>
            <input
              type="text"
              placeholder="NSBE12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter your NSBE membership ID
            </p>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Input Sizes</h2>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Small</label>
            <input
              type="text"
              placeholder="Small input"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default</label>
            <input
              type="text"
              placeholder="Default input"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Large</label>
            <input
              type="text"
              placeholder="Large input"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Textarea */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Textarea</h2>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default</label>
            <textarea
              rows={4}
              placeholder="Enter description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">With Character Count</label>
            <textarea
              rows={4}
              placeholder="Enter description..."
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent resize-none"
            />
            <p className="mt-1 text-sm text-gray-500 text-right">0 / 200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resizable</label>
            <textarea
              rows={4}
              placeholder="Enter description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D] focus:border-transparent resize-y"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

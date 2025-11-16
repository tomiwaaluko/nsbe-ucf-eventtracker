import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

interface ValidationError {
  field: string;
  message: string;
}

interface FormValidationProps {
  errors?: ValidationError[];
  type?: "inline" | "banner" | "modal";
  onDismiss?: () => void;
}

export function FormValidation({ errors = [], type = "inline", onDismiss }: FormValidationProps) {
  if (errors.length === 0) return null;

  if (type === "banner") {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">
              {errors.length === 1 ? "There is 1 error" : `There are ${errors.length} errors`} with your submission
            </h3>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-800">
                  • <strong>{error.field}:</strong> {error.message}
                </li>
              ))}
            </ul>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === "modal") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Validation Errors</h3>
              <p className="text-sm text-gray-600">Please fix the following issues:</p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="bg-red-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            <ul className="space-y-3">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <div className="flex-1">
                    <p className="font-medium text-red-900 text-sm">{error.field}</p>
                    <p className="text-sm text-red-700">{error.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onDismiss}
            className="w-full px-4 py-2 bg-[#00843D] text-white rounded-lg hover:bg-[#006830] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  // Inline type - individual field errors
  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <div key={index} className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error.message}</span>
        </div>
      ))}
    </div>
  );
}

// Individual field validation message
interface FieldValidationProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
}

export function FieldValidation({ type, message }: FieldValidationProps) {
  const styles = {
    error: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    success: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    info: {
      icon: Info,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`flex items-start gap-2 text-sm ${style.color} mt-1`}>
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// Form level validation summary
interface ValidationSummaryProps {
  errors: ValidationError[];
  warnings?: ValidationError[];
  onDismiss?: () => void;
}

export function ValidationSummary({ errors, warnings = [], onDismiss }: ValidationSummaryProps) {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) return null;

  return (
    <div className="space-y-3 mb-6">
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">
                {errors.length} {errors.length === 1 ? "error" : "errors"} found
              </h4>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-800">
                    • {error.field}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">
                {warnings.length} {warnings.length === 1 ? "warning" : "warnings"}
              </h4>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-800">
                    • {warning.field}: {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Real-time validation indicator
interface ValidationIndicatorProps {
  isValid: boolean;
  isValidating?: boolean;
  message?: string;
}

export function ValidationIndicator({ isValid, isValidating, message }: ValidationIndicatorProps) {
  if (isValidating) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#00843D] rounded-full animate-spin" />
        <span>Validating...</span>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
        <CheckCircle2 className="h-4 w-4" />
        <span>{message || "Looks good!"}</span>
      </div>
    );
  }

  return null;
}

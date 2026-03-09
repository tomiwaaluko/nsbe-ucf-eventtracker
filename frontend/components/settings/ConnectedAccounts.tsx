import { useState, useEffect } from "react";
import {
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface OAuthAccount {
  id: string;
  provider: string;
  providerEmail: string | null;
  emailVerified: boolean;
  createdAt: string;
}

const PROVIDERS = [
  {
    id: "google",
    name: "Google",
    description: "Sign in with your Google account",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    color: "border-[#4285F4]/20 bg-[#4285F4]/5",
    connectedColor: "border-[#34A853]/30 bg-[#34A853]/5",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Sign in with your Discord account",
    icon: (
      <svg className="w-8 h-8" fill="#5865F2" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    color: "border-[#5865F2]/20 bg-[#5865F2]/5",
    connectedColor: "border-[#5865F2]/30 bg-[#5865F2]/10",
  },
] as const;

export function ConnectedAccounts() {
  const [connectedAccounts, setConnectedAccounts] = useState<OAuthAccount[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchOAuthAccounts();
  }, []);

  const fetchOAuthAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const accounts = await api.getMyOAuthAccounts(token);
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error("Failed to fetch OAuth accounts:", error);
      toast.error("Failed to load connected accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (providerId: string) => {
    setConnectingProvider(providerId);
    const oauthUrl = api.getOAuthUrl(
      providerId as "google" | "discord",
      window.location.origin + "/auth/callback"
    );
    window.location.href = oauthUrl;
  };

  const getConnectedAccount = (providerId: string) => {
    return connectedAccounts.find((acc) => acc.provider === providerId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <LinkIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Connected Accounts
            </h4>
            <p className="text-sm text-blue-800">
              Link your Google or Discord account to sign in faster. If the
              provider email matches your account email, the accounts are
              automatically merged.
            </p>
          </div>
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-4">
        {PROVIDERS.map((provider) => {
          const connected = getConnectedAccount(provider.id);
          return (
            <div
              key={provider.id}
              className={`border-2 rounded-lg p-4 sm:p-5 transition-all ${
                connected ? provider.connectedColor : provider.color
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon and Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">{provider.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {provider.name}
                      </h3>
                      {connected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#00843D] text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </span>
                      )}
                    </div>
                    {connected ? (
                      <p className="text-sm text-gray-600">
                        {connected.providerEmail || "Connected"}
                        <span className="text-xs text-gray-400 ml-2">
                          since{" "}
                          {new Date(connected.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {provider.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {!connected && (
                    <button
                      onClick={() => handleConnect(provider.id)}
                      disabled={connectingProvider === provider.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#00843D] hover:bg-[#006830] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                    >
                      {connectingProvider === provider.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4" />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-2">
          How account linking works
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            &bull; If the provider email matches your account, the accounts are
            merged automatically
          </li>
          <li>
            &bull; We only request the minimum permissions needed (email and
            profile)
          </li>
          <li>
            &bull; All connections use secure OAuth 2.0 authentication
          </li>
        </ul>
      </div>
    </div>
  );
}

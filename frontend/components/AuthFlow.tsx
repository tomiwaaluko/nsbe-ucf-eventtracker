import { useState } from "react";
import { Login } from "./Login";
import { SignUp } from "./SignUp";
import { ForgotPassword } from "./ForgotPassword";
import { ResetPassword } from "./ResetPassword";
import { Onboarding } from "./Onboarding";
import { SuccessPage } from "./SuccessPage";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { api, getOAuthRedirectBase } from "@/lib/api";

interface AuthFlowProps {
  onAuthComplete: (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => void;
}

type AuthPage =
  | "login"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "onboarding"
  | "success-signup"
  | "success-password-reset";

export function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [currentPage, setCurrentPage] = useState<AuthPage>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "member",
  });
  const [resetToken, setResetToken] = useState("");

  // Authentication handlers with real Supabase integration
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store token
      if (data.session) {
        localStorage.setItem("token", data.session.access_token);

        // Fetch member data from backend to get role
        try {
          const memberData = await api.getMe(data.session.access_token);

          toast.success("Welcome back!", {
            description: "You have successfully signed in.",
          });

          // Pass complete user data including role
          const userData = {
            email: memberData.email || email,
            firstName:
              memberData.firstName ||
              data.user?.user_metadata?.first_name ||
              "User",
            lastName:
              memberData.lastName || data.user?.user_metadata?.last_name || "",
            role: memberData.role || "member",
          };

          onAuthComplete(userData);
        } catch (memberError) {
          console.error("Failed to fetch member data:", memberError);

          // Fallback: use basic user data
          toast.success("Welcome back!", {
            description: "You have successfully signed in.",
          });

          const user = data.user;
          onAuthComplete({
            email: user?.email || email,
            firstName: user?.user_metadata?.first_name || "User",
            lastName: user?.user_metadata?.last_name || "",
            role: "member",
          });
        }
      }
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.message || "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);

    try {
      // Create Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
          emailRedirectTo: `${getOAuthRedirectBase()}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // Store user data for onboarding
      setUserData({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "member",
      });

      // Store token if session created (auto-confirm disabled)
      if (authData.session) {
        localStorage.setItem("token", authData.session.access_token);

        toast.success("Account created successfully!", {
          description: "Welcome to NSBE UCF Event Tracker!",
        });

        setCurrentPage("success-signup");

        // Auto-navigate to onboarding after 2 seconds
        setTimeout(() => {
          setCurrentPage("onboarding");
        }, 2000);
      } else {
        // Email confirmation required
        toast.success("Account created!", {
          description:
            "Please check your email to verify your account before signing in.",
        });

        // Go back to login after showing message
        setTimeout(() => {
          setCurrentPage("login");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("Sign up failed", {
        description:
          error.message ||
          "Unable to create account. Please try a different email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getOAuthRedirectBase()}/reset-password`,
      });

      if (error) throw error;

      toast.success("Email sent!", {
        description: "Check your inbox for password reset instructions.",
      });

      // Store email for reference
      setUserData({ ...userData, email });

      // In production, user clicks link in email
      // For now, show success message
      setTimeout(() => {
        setCurrentPage("login");
      }, 3000);
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (password: string, token: string) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      toast.success("Password reset successful!", {
        description: "You can now sign in with your new password.",
      });

      setCurrentPage("success-password-reset");

      // Auto-navigate to login after 3 seconds
      setTimeout(() => {
        setCurrentPage("login");
      }, 3000);
    }, 1500);
  };

  const handleOnboardingComplete = () => {
    toast.success("You're all set!", {
      description: "Welcome to NSBE UCF Event Tracker.",
    });

    onAuthComplete(userData);
  };

  const handleContinueFromSuccess = () => {
    if (currentPage === "success-signup") {
      setCurrentPage("onboarding");
    } else if (currentPage === "success-password-reset") {
      setCurrentPage("login");
    }
  };

  // Render current page
  switch (currentPage) {
    case "login":
      return (
        <Login
          onLogin={handleLogin}
          onNavigate={(page) => setCurrentPage(page)}
          isLoading={isLoading}
        />
      );

    case "signup":
      return (
        <SignUp
          onSignUp={handleSignUp}
          onNavigate={(page) => setCurrentPage(page)}
          isLoading={isLoading}
        />
      );

    case "forgot-password":
      return (
        <ForgotPassword
          onSubmit={handleForgotPassword}
          onNavigate={(page) => setCurrentPage(page)}
          isLoading={isLoading}
        />
      );

    case "reset-password":
      return (
        <ResetPassword
          onSubmit={handleResetPassword}
          token={resetToken}
          isLoading={isLoading}
        />
      );

    case "onboarding":
      return (
        <Onboarding
          onComplete={handleOnboardingComplete}
          userName={userData.firstName}
        />
      );

    case "success-signup":
      return (
        <SuccessPage
          type="signup"
          onContinue={handleContinueFromSuccess}
          email={userData.email}
        />
      );

    case "success-password-reset":
      return (
        <SuccessPage
          type="password-reset"
          onContinue={handleContinueFromSuccess}
        />
      );

    default:
      return null;
  }
}

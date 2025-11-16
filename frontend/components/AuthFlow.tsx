import { useState } from "react";
import { Login } from "./Login";
import { SignUp } from "./SignUp";
import { ForgotPassword } from "./ForgotPassword";
import { ResetPassword } from "./ResetPassword";
import { EmailVerification } from "./EmailVerification";
import { Onboarding } from "./Onboarding";
import { SuccessPage } from "./SuccessPage";
import { toast } from "sonner";

interface AuthFlowProps {
  onAuthComplete: (userData: {
    email: string;
    firstName: string;
    lastName: string;
  }) => void;
}

type AuthPage =
  | "login"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "email-verification"
  | "onboarding"
  | "success-signup"
  | "success-password-reset"
  | "success-email-verified";

export function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [currentPage, setCurrentPage] = useState<AuthPage>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [resetToken, setResetToken] = useState("");

  // Mock authentication handlers - replace with real API calls
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock success
      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      });
      
      onAuthComplete({
        email,
        firstName: "John",
        lastName: "Doe",
      });
    }, 1500);
  };

  const handleSignUp = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Store user data
      setUserData({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      // Show success and move to email verification
      toast.success("Account created successfully!", {
        description: "Please check your email to verify your account.",
      });
      
      setCurrentPage("success-signup");
      
      // Auto-navigate to email verification after 3 seconds
      setTimeout(() => {
        setCurrentPage("email-verification");
      }, 3000);
    }, 1500);
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast.success("Email sent!", {
        description: "Check your inbox for password reset instructions.",
      });
      
      // Store email for later use
      setUserData({ ...userData, email });
      
      // In a real app, the user would click a link in their email
      // For demo purposes, we'll simulate getting a reset token
      setResetToken("demo-reset-token-123");
      
      // Show reset password form after a delay (simulating user clicking email link)
      setTimeout(() => {
        setCurrentPage("reset-password");
      }, 2000);
    }, 1500);
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

  const handleResendVerificationEmail = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast.success("Verification email sent!", {
        description: "Please check your inbox.",
      });
    }, 1500);
  };

  const handleEmailVerified = () => {
    toast.success("Email verified!", {
      description: "Your account is now fully activated.",
    });
    
    setCurrentPage("success-email-verified");
    
    // Auto-navigate to onboarding after 2 seconds
    setTimeout(() => {
      setCurrentPage("onboarding");
    }, 2000);
  };

  const handleOnboardingComplete = () => {
    toast.success("You're all set!", {
      description: "Welcome to NSBE UCF Event Tracker.",
    });
    
    onAuthComplete(userData);
  };

  const handleContinueFromSuccess = () => {
    if (currentPage === "success-signup") {
      setCurrentPage("email-verification");
    } else if (currentPage === "success-password-reset") {
      setCurrentPage("login");
    } else if (currentPage === "success-email-verified") {
      setCurrentPage("onboarding");
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

    case "email-verification":
      return (
        <EmailVerification
          email={userData.email}
          onResendEmail={handleResendVerificationEmail}
          onVerified={handleEmailVerified}
          onChangeEmail={() => setCurrentPage("signup")}
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

    case "success-email-verified":
      return (
        <SuccessPage
          type="email-verified"
          onContinue={handleContinueFromSuccess}
          email={userData.email}
        />
      );

    default:
      return null;
  }
}

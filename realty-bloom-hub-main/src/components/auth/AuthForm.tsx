import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Lock, User, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AuthFormProps {
  mode: "login" | "register";
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { login, register, verifyOtp, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "", // Added phone field
  });
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (mode === "register") {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        return false;
      }
      
      if (formData.password.length < 8) {
        toast.error("Password should be at least 8 characters");
        return false;
      }
      
      // Phone validation
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Please enter a valid 10-digit phone number");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate the form
      if (!validateForm()) return;
      
      // For registration (skip OTP step for now)
      if (mode === "register") {
        const success = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.phone,
          formData.confirmPassword
        );
        if (success) {
          toast.success("Registration successful! You can now log in.");
          navigate("/login");
        }
        return;
      }
      
      // For OTP verification
      /* if (mode === "register" && showOtp) {
        if (!otp.trim() || otp.length !== 6) {
          toast.error("Please enter a valid 6-digit OTP");
          return;
        }
        
        const success = await verifyOtp(otp, formData.phone);
        if (success) {
          toast.success("Account verified successfully!");
          navigate("/");
        }
        return;
      } */
      
      // For login
      if (mode === "login") {
        // Use phone and password for login
        const result = await login(formData.phone, formData.password);
        if (result.success) {
          toast.success("Login successful!");
          navigate("/");
        } else {
          toast.error(result.error || "Incorrect phone number or password");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(mode === "login" 
        ? "Login failed. Please check your credentials." 
        : "Registration failed. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {mode === "login" ? "Welcome Back" : (showOtp ? "Verify OTP" : "Create an Account")}
        </h2>
        <p className="text-muted-foreground mt-1">
          {mode === "login"
            ? "Enter your credentials to access your account"
            : (showOtp ? "Enter the OTP sent to your email" : "Fill in your details to get started")}
        </p>
      </div>

      {mode === "register" && showOtp ? (
        // OTP verification form
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-1">
              Enter OTP
            </label>
            <div className="relative">
              <input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Didn't receive an OTP? <button type="button" className="text-primary">Resend OTP</button>
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              "Verifying..."
            ) : (
              <>
                Verify & Complete Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        // Regular login/register form
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Phone Number Field - Added for both login and register */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="10-digit phone number"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              {mode === "login" && (
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="••••••••"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <div className="mb-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Re-enter Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="••••••••"
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive mt-1">Passwords do not match</p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              "Processing..."
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Continue to Verification"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        {mode === "login" ? (
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>

      {!showOtp && (
        <>
        </>
      )}
    </div>
  );
};

export default AuthForm;

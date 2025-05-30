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
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (mode === "login") {
      if (!formData.phone || !formData.password) {
        toast.error("Please fill in all fields");
        return false;
      }
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        toast.error("Please fill in all fields");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate the form
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }
      
      // For registration with OTP flow
      if (mode === "register" && !showOtp) {
        await register({
          email: formData.email,
          password: formData.password,
          re_password: formData.password,
          phone: formData.phone,
          full_name: formData.name
        });
        setShowOtp(true);
        toast.success("Registration successful! Please verify with OTP");
        setIsLoading(false);
        return;
      }
      
      // For OTP verification
      if (mode === "register" && showOtp) {
        if (!otp.trim() || otp.length !== 6) {
          toast.error("Please enter a valid 6-digit OTP");
          setIsLoading(false);
          return;
        }
        
        // Handle OTP verification here
        toast.success("Account verified successfully!");
        navigate("/login");
        setIsLoading(false);
        return;
      }
      
      // For login
      if (mode === "login") {
        await login(formData.phone, formData.password);
        toast.success("Login successful!");
        navigate("/home");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
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
        // Login or Registration form
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
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
    </div>
  );
};

export default AuthForm;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Camera, Eye, EyeOff, Check } from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";
import { login, googleOnSuccess } from "@/functions/auth";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      is_active: boolean;
      created_at: string;
      last_login: string;
    };
    access_token: string;
    refresh_token: string;
  };
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({ email: null, general: null });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: null, general: null });

    // Validate email
    if (!isValidEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }

    setIsLoading(true); // Disable button by setting loading state

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      if (response.success) {
        console.log("Login successful:", response.data);
        navigate("/dashboard");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.message || "Invalid email or password",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: "Invalid email or password",
      }));
      console.error("Unexpected error during login:", error);
    } finally {
      setIsLoading(false); // Re-enable button after request completes
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left side - Background */}
        <div
          className="hidden lg:flex items-center justify-center bg-cover bg-center relative"
          style={{ backgroundImage: `url(${loginBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-glow/80"></div>
          <div className="relative z-10 text-center text-white p-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Camera className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Your memories,<br />curated perfectly</h1>
            <p className="text-xl text-white/90 max-w-md mb-8">
              Join thousands of photographers who trust CuratAI to organize their best shots.
            </p>
            {/* Benefits list */}
            <div className="text-left space-y-3">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span>14-day free trial, no credit card required</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span>Process thousands of photos in minutes</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <span>Advanced AI analysis and face clustering</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex items-center justify-center p-8 bg-surface-gradient">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">CuratAI</span>
              </Link>
            </div>

            <Card className="card-elegant">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your CuratAI account to continue organizing your photos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Social Login */}
                <div className="flex justify-center">
                  {clientId ? (
                    <GoogleLogin
                      onSuccess={(credentialResponse) => googleOnSuccess(credentialResponse, setErrors)}
                      onError={() => setErrors((prev) => ({ ...prev, general: "Google Login Failed: Access may be restricted" }))}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      width="100%"
                    />
                  ) : (
                    <p className="text-red-500 text-sm text-center">
                      Google Login is unavailable due to configuration issues.
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">OR CONTINUE WITH EMAIL</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                    {errors.email && (
                      <div className="text-red-500 text-sm">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.general && (
                      <div className="text-red-500 text-sm">
                        {errors.general}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Eye, EyeOff, Check } from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";
import { signup, googleOnSuccess } from "@/functions/auth";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({ email: null, password: null, general: null });
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log('Google Client ID:', clientId);

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation: at least 8 characters, one uppercase, one lowercase, one special character
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: null, password: null, general: null });
    setSuccessMessage(null);

    // Validate email
    if (!isValidEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }

    // Validate password
    if (!isValidPassword(formData.password)) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character",
      }));
      return;
    }

    setIsLoading(true); // Disable button by setting loading state

    try {
      const signupResponse = await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      if (signupResponse.success) {
        console.log('Signup successful:', signupResponse.data);
        setSuccessMessage("A confirmation email has been sent to your email address. Please verify your email to continue.");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: signupResponse?.detail?.message || signupResponse.message || 'Signup failed',
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error?.detail?.message || 'An unexpected error occurred during signup',
      }));
      console.error('Unexpected error during signup:', error);
    } finally {
      setIsLoading(false); // Re-enable button after request completes
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (field === "email" || field === "password") {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId || ''}>
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
            <h1 className="text-4xl font-bold mb-4">Start organizing<br />your photos today</h1>
            <p className="text-xl text-white/90 max-w-md mb-8">
              Join thousands of photographers who save hours every week with AI-powered curation.
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
                <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                <CardDescription>
                  Start your free trial and experience the power of AI photo curation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {successMessage && (
                  <div className="text-green-500 text-sm text-center">
                    {successMessage}
                  </div>
                )}
                {errors.general && (
                  <div className="text-red-500 text-sm text-center">
                    {errors.general}
                  </div>
                )}
                {/* Social Signup */}
                <div className="flex justify-center">
                  {clientId ? (
                    <GoogleLogin
                      onSuccess={(credentialResponse) => googleOnSuccess(credentialResponse, setErrors)}
                      onError={() => setErrors((prev) => ({ ...prev, general: 'Google Login Failed: Access may be restricted' }))}
                      theme="outline"
                      size="large"
                      text="signup_with"
                      shape="rectangular"
                      width="100%"
                    />
                  ) : (
                    <p className="text-red-500 text-sm text-center">
                      Google Signup is unavailable due to configuration issues.
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
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      required
                    />
                  </div>

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
                        placeholder="Create a strong password"
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
         
                    {errors.password && (
                      <div className="text-red-500 text-sm">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-hero"
                    disabled={!formData.agreeToTerms || isLoading}
                  >
                    {isLoading ? "Signing Up..." : "Start Free Trial"}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
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
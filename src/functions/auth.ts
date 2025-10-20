import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface SignupData {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
}

interface SignupResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface DecodedToken {
  name: string;
  email: string;
  sub: string;
}

interface LoginData {
  email: string;
  password: string;
}

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

export const signup = async (data: SignupData): Promise<SignupResponse> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const response = await axios.post(`${backendUrl}/auth/signup`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'A verification link has been sent to your email',
    };
  } catch (error: any) {
    console.log('Full error response:', error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed',
    };
  }
};

export const googleSignup = async (
  credentialResponse: { credential?: string },
  setErrors: (errors: { general?: string; email?: string }) => void,
  setSuccess: (message: string | null) => void
) => {
  if (!credentialResponse.credential) {
    setErrors({ general: 'No credential provided by Google' });
    return;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(credentialResponse.credential);
    console.log('Decoded Google token:', decoded);
    const { name, email, sub } = decoded;

    // Generate unique username
    const baseUsername = name.replace(/\s+/g, '').toLowerCase();
    const username = `${baseUsername}_${sub.slice(-4)}`;

    // Generate a secure password
    const password = `Google@${sub.slice(-8)}!Aa1`;

    const response = await signup({
      username,
      email,
      password,
    });

    if (response.success) {
      console.log('Google Signup successful:', response.data);
      setErrors({});
      setSuccess(response.message || 'A verification link has been sent to your email');
    } else {
      if (response.message?.includes('Email already exists')) {
        setErrors({
          email: 'This email is already registered. Please use a different email or sign in.',
        });
      } else {
        setErrors({ general: response.message || 'Google Signup failed' });
      }
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Google signup failed. Please try again.';
    if (errorMessage.includes('Email already exists')) {
      setErrors({
        email: 'This email is already registered. Please use a different email or sign in.',
      });
    } else {
      setErrors({ general: errorMessage });
    }
    console.error('Unexpected error during Google signup:', error);
  }
};

export const googleLogin = async (
  credentialResponse: { credential?: string },
  setErrors: (errors: { general?: string; email?: string }) => void,
  setSuccess: (message: string | null) => void,
  navigate: (path: string) => void
) => {
  if (!credentialResponse.credential) {
    setErrors({ general: 'No credential provided by Google' });
    return;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(credentialResponse.credential);
    console.log('Decoded Google token:', decoded);
    const { email, sub } = decoded;

    // Regenerate the password used during signup
    const password = `Google@${sub.slice(-8)}!Aa1`;

    // Call the regular login endpoint with email and regenerated password
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const response = await axios.post(
      `${backendUrl}/auth/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
      }
    );

    // Check for successful login based on the presence of access_token and user
    if (response.data.access_token && response.data.user) {
      console.log('Google Login successful:', response.data);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setErrors({});
      setSuccess(null);
      navigate('/projects');
    } else {
      if (response.data.message?.includes('Email not verified')) {
        setSuccess('Please verify your email to continue. Check your inbox for a verification link.');
      } else if (response.data.message?.includes('Email not found')) {
        setErrors({
          email: 'This email is not registered. Please sign up or try a different email.',
        });
      } else {
        setErrors({ general: response.data.message || 'Google Login failed' });
      }
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Google login failed. Please try again.';
    if (errorMessage.includes('Email not verified')) {
      setSuccess('Please verify your email to continue. Check your inbox for a verification link.');
    } else if (errorMessage.includes('Email not found')) {
      setErrors({
        email: 'This email is not registered. Please sign up or try a different email.',
      });
    } else {
      setErrors({ general: errorMessage });
    }
    console.error('Unexpected error during Google login:', error);
  }
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const response = await axios.post(`${backendUrl}/auth/login`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
    });

    // Check for successful login based on the presence of access_token and user
    if (response.data.access_token && response.data.user) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Login response data:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } else {
      console.log('Login failed:', response.data);
      return {
        success: false,
        message: response.data.message || 'Login failed',
      };
    }
  } catch (error: any) {
    console.log('Full error response:', error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    };
  }
};

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
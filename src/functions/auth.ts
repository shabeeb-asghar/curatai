import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import crypto from 'crypto';

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
    };
  } catch (error: any) {
    console.log('Full error response:', error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed',
    };
  }
};

export const googleOnSuccess = async (credentialResponse: { credential?: string }, setError: (error: string | null) => void) => {
  if (!credentialResponse.credential) {
    setError('No credential provided by Google');
    return;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(credentialResponse.credential);
    console.log('Decoded Google token:', decoded);
    const { name, email, sub } = decoded;

    // Generate unique username to avoid conflicts
    const baseUsername = name.replace(/\s+/g, '').toLowerCase();
    const username = `${baseUsername}_${sub.slice(-4)}`;

    // Generate a secure random password for OAuth users
    const password = `@Google_${crypto.randomBytes(8).toString('hex')}`;

    const response = await signup({
      username,
      email,
      password,
      googleId: sub, // Include googleId for backend to identify OAuth users
    });

    if (response.success) {
      console.log('Google Signup successful:', response.data);
      // Handle successful signup (e.g., redirect to dashboard)
    } else {
      setError(response.message || 'Google Signup failed');
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Google signup failed. Please try again.';
    setError(errorMessage);
    console.error('Unexpected error during Google signup:', error);
  }
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    console.log('Login data:', data);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const response = await axios.post(`${backendUrl}/auth/login`, data, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    });

    // Store user details and access token in local storage
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    
    console.log('Login response data:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.log('Full error response:', error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    };
  }
};

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
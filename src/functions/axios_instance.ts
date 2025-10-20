import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// ✅ Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
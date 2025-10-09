import axios from "axios";

// ✅ Load API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// ✅ Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Helper to get auth headers (token-based)
export const getAuthHeaders = () => {
  const userDataStr = localStorage.getItem("user");
  if (!userDataStr) return {};

  try {
    const userData = JSON.parse(userDataStr);
    if (userData?.access_token) {
      return { Authorization: `Bearer ${userData.access_token}` };
    }
  } catch (err) {
    console.error("Invalid user object in localStorage:", err);
  }

  return {};
};


// ✅ Projects API
export const projectsApi = {
 getAll: async (userId: string) => {
  try {
    const response = await api.get(`/projects?user_id=${userId}`, {
      headers: getAuthHeaders(),
    });
    // ✅ FIX: return the array instead of the wrapper object
    return response.data.projects || [];
  } catch (error: any) {
    console.error("❌ Error fetching projects:", error.response?.data || error.message);
    throw error;
  }
},

  create: async (projectName: string, userId: string) => {
    try {
      const response = await api.post(
        "/projects",
        { project_name: projectName, user_id: userId },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating project:", error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (projectId: string) => {
    try {
      const response = await api.delete(`/projects/${projectId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error deleting project:", error.response?.data || error.message);
      throw error;
    }
  },

  validate: async (projectId: string) => {
    try {
      const response = await api.get(`/projects/${projectId}/validate`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error validating project:", error.response?.data || error.message);
      throw error;
    }
  },
};

// ✅ Images API
export const imagesApi = {
  uploadZip: async (
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);

    try {
      const response = await api.post("/images/upload/zip", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error uploading zip:", error.response?.data || error.message);
      throw error;
    }
  },

 getProjectImages: async (projectId: string) => {
  try {
    const response = await api.get(`/images/${projectId}`, {
      headers: getAuthHeaders(),
    });
    // ✅ FIX: Return the array inside response.data.images
    return response.data.images || [];
  } catch (error: any) {
    console.error("❌ Error fetching project images:", error.response?.data || error.message);
    throw error;
  }
},

};

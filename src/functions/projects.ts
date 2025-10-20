import axios from "axios";
import { api } from "./axios_instance";

export interface Project {
  id: string;
  project_name: string;
  image_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface Image {
  id: string;
  created_at: string;
  image_url: string;
  project_id: string;
}

// Helper to get auth headers (token-based)
export const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    console.error("No access token found in localStorage");
    return {};
  }

  return { Authorization: `Bearer ${accessToken}` };
};

// Projects API
export const projectsApi = {
  getAll: async (userId: string) => {
    try {
      const response = await api.get(`/projects?user_id=${userId}`, {
        headers: getAuthHeaders(),
      });
      console.log("Fetched projects:", response.data.projects);
      return response.data.projects || [];
    } catch (error: any) {
      console.error("Error fetching projects:", error.response?.data || error.message);
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
      console.error("Error creating project:", error.response?.data || error.message);
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
      console.error("Error deleting project:", error.response?.data || error.message);
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
      console.error("Error validating project:", error.response?.data || error.message);
      throw error;
    }
  },
};

// Images API
export const imagesApi = {
  uploadZip: async (
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Image[]> => {
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

      const { project_id, images_data } = response.data;

      // Convert images_data object to ImageType array
      const images: Image[] = Object.entries(images_data).map(([url, data], index) => ({
        id: `${project_id}-${index}-${Date.now()}`, // Generate a unique ID
        created_at: new Date().toISOString(),
        image_url: url, // Use the URL as image_url
        project_id,
      }));

      // Call facial recognition with the images_data
      try {
        const faceRecognitionResponse = await imagesApi.faceRecognition(project_id, images_data);
        // Assuming faceRecognition returns an array of processed images or similar structure
        // Adjust based on actual response
// Fallback to original images if facial recognition doesn't return images

        return images;
      } catch (error) {
        console.warn("Facial recognition failed, returning original images:", error);
        return images; // Fallback to original images if facial recognition fails
      }
    } catch (error: any) {
      console.error("Error uploading zip:", error.response?.data || error.message);
      throw error;
    }
  },

  getProjectImages: async (projectId: string) => {
    try {
      const response = await api.get(`/images/${projectId}`, {
        headers: getAuthHeaders(),
      });
      return response.data.images || [];
    } catch (error: any) {
      console.error("Error fetching project images:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteImage: async (projectId: string, imageId: string) => {
    try {
      const response = await api.delete(`/images/${projectId}/${imageId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error("Error deleting image:", error.response?.data || error.message);
      throw error;
    }
  },

  faceRecognition: async (projectId: string, imagesData: Record<string, [string, string]>) => {
    try {
      const response = await api.post(
        "/face_recognition",
        {
          project_id: projectId,
          images_data: imagesData,
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error in face recognition:", error.response?.data || error.message);
      throw error;
    }
  },
};
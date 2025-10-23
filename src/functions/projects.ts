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

export interface Album {
  id: string;
  created_at: string;
  project_id: string;
  person_name: string;
  image_group: string[]; // Array of image IDs
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

// Albums API
export const albumsApi = {
  getAll: async (projectId: string): Promise<Album[]> => {
    try {
      const response = await api.get(`/albums/get-albums-list?project_id=${projectId}`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error("Error fetching albums:", error.response?.data || error.message);
      throw error;
    }
  },

  getAlbumImages: async (albumId: string): Promise<{
    album: Album;
    image_links: string[];
  }> => {
    try {
      const response = await api.get(`/albums/get-album-images?album_id=${albumId}`, {
        headers: getAuthHeaders(),
      });
      return {
        album: response.data.data,
        image_links: response.data.image_links || [],
      };
    } catch (error: any) {
      console.error("Error fetching album images:", error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (albumId: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await api.delete(`/albums/delete-album`, {
        headers: getAuthHeaders(),
        data: { album_id: albumId }, // Send album_id in the request body
      });
      return response.data;
    } catch (error: any) {
      console.error("Error deleting album:", error.response?.data || error.message);
      throw error;
    }
  },

  generate: async (projectId: string, personName: string, image: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append("project_id", projectId);
    formData.append("person_name", personName);
    formData.append("image", image);

    try {
      const response = await api.post("/albums/generate-albums", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
          accept: "application/json",
        },
      });
      return response.data.data || []; // Returns array of album IDs
    } catch (error: any) {
      console.error("Error generating album:", error.response?.data || error.message);
      throw error;
    }
  },
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

      // Convert images_data object to Image array
      const images: Image[] = Object.entries(images_data).map(([url, filename], index) => ({
        id: `${project_id}-${index}-${Date.now()}`,
        created_at: new Date().toISOString(),
        image_url: url,
        project_id,
      }));

      // Call facial recognition
      try {
        const faceRecognitionResponse = await imagesApi.faceRecognition(project_id, images_data);
        // Merge facial recognition results into images
        const updatedImages: Image[] = images.map((image) => {
          const faceData = faceRecognitionResponse.images?.find(
            (fi: any) => fi.image_url === image.image_url
          );
          return {
            ...image,
            person_name: faceData?.person_name,
            album_id: faceData?.album_id,
          };
        });
        return updatedImages;
      } catch (error: any) {
        console.error("Facial recognition failed:", error.response?.data || error.message);
        throw new Error("Facial recognition failed, returning original images");
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

  faceRecognition: async (projectId: string, imagesData: Record<string, string>) => {
    try {
      const response = await api.post(
        "/face_recognition",
        {
          project_id: projectId,
          images_data: imagesData, // { url: filename }
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Expected: { images: [{ image_url, person_name?, album_id? }], albums? }
    } catch (error: any) {
      console.error("Error in face recognition:", error.response?.data || error.message);
      throw error;
    }
  },

  searchImages: async (projectId: string, searchQuery: string): Promise<{
    message: string;
    result: {
      related_image_ids: string[];
      image_links: string[];
    };
  }> => {
    try {
      const formData = new URLSearchParams();
      formData.append('project_id', projectId);
      formData.append('search_query', searchQuery);

      const response = await api.post('/image_searching/', formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error searching images:', error.response?.data || error.message);
      throw error;
    }
  },
};


export default async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<File | null> {
  try {
    // Download the image
    const response = await axios.get(imageSrc, {
      responseType: 'blob',
      headers: {
        'Accept': 'image/jpeg',
      },
    });

    const imageBlob = response.data;
    const image = await createImage(URL.createObjectURL(imageBlob));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Failed to get canvas context');
      return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          resolve(null);
          return;
        }
        // Create a File object with the original filename or a default
        const filename = imageSrc.split('/').pop() || 'cropped-image.jpg';
        const file = new File([blob], filename, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg');
    });
  } catch (error) {
    console.error('Error downloading or cropping image:', error);
    return null;
  }
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

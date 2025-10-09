import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageGallery } from "@/components/ImageGallery";
import { AISearchPanel } from "@/components/AISearchPanel";
import { projectsApi, imagesApi } from "@/lib/api";
import { toast } from "sonner";

interface ProjectData {
  id: string;
  project_name: string;
  image_count: number;
}

interface ImageData {
  id: string;
  url: string;
  filename: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      validateAndFetchProject();
    }
  }, [projectId]);

  const validateAndFetchProject = async () => {
    if (!projectId) return;

    try {
      const projectData = await projectsApi.validate(projectId);
      setProject(projectData);
      await fetchImages();
    } catch (error) {
      console.error('Error validating project:', error);
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    if (!projectId) return;

    try {
      const imagesData = await imagesApi.getProjectImages(projectId);
      setImages(imagesData);
      console.log('Fetched images:', imagesData);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    }
  };

  const handleUpload = async (file: File, onProgress: (progress: number) => void) => {
    if (!projectId) return;

    try {
      await imagesApi.uploadZip(projectId, file, onProgress);
      toast.success('Images uploaded successfully!');
      await fetchImages();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/projects')}
            className="hover:bg-muted transition-smooth"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {project.project_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
          <ImageUpload onUpload={handleUpload} />
        </div>

        {/* AI Search Panel */}
        {/* <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <AISearchPanel />
        </div> */}

        {/* Images Gallery */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-semibold mb-4">Gallery</h2>
          <ImageGallery images={images} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

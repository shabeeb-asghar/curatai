// Updated Projects.tsx
import { useState } from 'react';
import { ProjectsSidebar } from '@/components/sidebar/ProjectsSidebar';
import { toast } from 'sonner';
import { AllImages } from '@/components/chat/AllImages'; // New component
import { MainChatArea } from '@/components/chat/MainChatArea'; // Updated
import { AlbumsView } from '@/components/albums/AlbumsView'; // New component
import  {Button} from '@/components/ui/button';
import {NavigationTabs} from '@/components/NavigationTabs';

interface ImageType {
  id: string;
  url: string;
}

const Projects = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all-images' | 'chat' | 'albums'>('chat');

  // Retrieve userId from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData.id || "";

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadProgress(0);
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleProjectsLoadingChange = (isLoading: boolean) => {
    setIsProjectsLoading(isLoading);
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Full-screen loader for project loading */}
      {isProjectsLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Loading Projects...</p>
          </div>
        </div>
      )}

      {/* Full-screen loader for uploading */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Uploading Images...</p>
            <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
            <div className="w-64 mt-4">
              <div className="w-full bg-muted h-2 rounded">
                <div
                  className="bg-primary h-2 rounded transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProjectsSidebar
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        userId={userId}
        disabled={isUploading}
        onProjectsLoadingChange={handleProjectsLoadingChange}
      />

      <NavigationTabs
        selectedProjectId={selectedProjectId}
        isUploading={isUploading}
        handleUploadStart={handleUploadStart}
        handleUploadProgress={handleUploadProgress}
        handleUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default Projects;
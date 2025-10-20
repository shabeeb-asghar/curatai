import { useState } from 'react';
import { ProjectsSidebar } from '@/components/sidebar/ProjectsSidebar';
import { MainChatArea } from '@/components/chat/MainChatArea';
import { toast } from 'sonner';

interface ImageType {
  id: string;
  url: string;
}

const Projects = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false); // New loading state

  // Retrieve userId from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData.id || "";

  const handleSearch = async (query: string) => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }
    if (isUploading) {
      toast.error('Please wait until the upload is complete');
      return;
    }

    try {
      toast.info('Search functionality is not yet implemented');
    } catch (error) {
      toast.error('Search failed. Please try again.');
      toast.info('Search functionality is not yet implemented');
    }
  };

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
        onProjectsLoadingChange={handleProjectsLoadingChange} // Pass callback
      />

      <div className="flex-1 flex flex-col">
        <MainChatArea
          projectId={selectedProjectId}
          isUploading={isUploading}
          onUploadStart={handleUploadStart}
          onUploadProgress={handleUploadProgress}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  );
};

export default Projects;
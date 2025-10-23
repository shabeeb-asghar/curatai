import { useState, useEffect } from 'react';
import { Image as ImageType, imagesApi } from '@/functions/projects';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Loader2, ZoomIn, Plus, X, Upload } from 'lucide-react';
import { ImageUpload } from '../upload/ImageUpload';
import { cn } from '@/lib/utils';

interface AllImagesProps {
  projectId: string | null;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadProgress: (progress: number) => void;
  onUploadComplete: () => void;
}

export const AllImages = ({
  projectId,
  isUploading,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
}: AllImagesProps) => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadImages();
    }
  }, [projectId]);

  const loadImages = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const data = await imagesApi.getProjectImages(projectId);
      setImages(data);
    } catch (error) {
      // toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!projectId) return;
    setDeletingIds(prev => new Set([...prev, imageId]));
    try {
      await imagesApi.deleteImage(projectId, imageId);
      setImages(images.filter(img => img.id !== imageId));
      toast.success('Image deleted');
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    } catch (error) {
      toast.error('Failed to delete image');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  const handleUploadCompleteInternal = async (newImages: ImageType[]) => {
    await loadImages();
    setShowUploadModal(false);
    onUploadComplete();
  };

  if (!projectId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 sm:p-8">
        <div className="text-center">
          <p className="text-base sm:text-lg font-medium">No Project Selected</p>
          <p className="text-xs sm:text-sm mt-2">Select a project to view its images</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          <p className="text-xs sm:text-sm text-muted-foreground">Loading images...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md sm:max-w-2xl">
          <ImageUpload
            projectId={projectId}
            onUploadStart={onUploadStart}
            onUploadProgress={onUploadProgress}
            onUploadComplete={handleUploadCompleteInternal}
            disabled={isUploading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {images.map(image => (
            <div
              key={image.id}
              className="break-inside-avoid group relative rounded-xl overflow-hidden bg-muted/50 hover:bg-muted transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative">
                <img
                  src={image.image_url}
                  alt=""
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 shadow-lg"
                  onClick={(e) => handleDelete(image.id, e)}
                  disabled={deletingIds.has(image.id)}
                >
                  {deletingIds.has(image.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => setShowUploadModal(true)}
        disabled={isUploading}
        className={cn(
          "fixed bottom-6 right-6 sm:bottom-8 sm:right-8 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl transition-all duration-300 z-40",
          "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700",
          "hover:scale-105 hover:shadow-violet-500/50",
          isUploading && "animate-pulse"
        )}
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
        ) : (
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </Button>

      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => !isUploading && setShowUploadModal(false)}
        >
          <div
            className="relative w-full max-w-md sm:max-w-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-10 right-0 sm:-top-12 sm:right-0 text-white hover:text-white hover:bg-white/20 z-10"
                onClick={() => setShowUploadModal(false)}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            )}
            <ImageUpload
              projectId={projectId}
              onUploadStart={onUploadStart}
              onUploadProgress={onUploadProgress}
              onUploadComplete={handleUploadCompleteInternal}
              disabled={isUploading}
            />
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={selectedImage.image_url}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
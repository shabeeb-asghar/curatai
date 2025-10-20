import { useState, useEffect } from 'react';
import { Image, imagesApi } from '@/functions/projects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Tag, FolderPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface ImageGalleryModalProps {
  images: Image[];
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImageGalleryModal = ({
  images,
  projectId,
  open,
  onOpenChange,
}: ImageGalleryModalProps) => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [localImages, setLocalImages] = useState<Image[]>(images);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null); // Loading state for deletion

  useEffect(() => {
    setLocalImages(images); // Sync localImages with prop changes
  }, [images]);

  const handleDelete = async (imageId: string) => {
    setDeletingImageId(imageId); // Set deletion loading state
    try {
      await imagesApi.deleteImage(projectId, imageId);
      setLocalImages(localImages.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    } catch (error) {
      toast.error('Failed to delete image');
    } finally {
      setDeletingImageId(null); // Reset deletion loading state
    }
  };

  const handleDownload = (image: Image) => {
    const link = document.createElement('a');
    link.href = image.image_url;
    // Extract filename from image_url or use a default
    const filename = image.image_url.split('/').pop() || `image-${image.id}.jpg`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            All Images ({localImages.length})
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[70vh]">
          {/* Gallery Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {localImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImage?.id === image.id
                      ? 'ring-2 ring-primary shadow-glow'
                      : 'hover:opacity-80'
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt={`Image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Image Viewer */}
          {selectedImage && (
            <div className="w-96 border-l pl-4 flex flex-col">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                <img
                  src={selectedImage.image_url}
                  alt={`Image ${selectedImage.id}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Filename</div>
                  <div className="text-sm font-medium truncate">
                    {selectedImage.image_url.split('/').pop() || 'Unnamed Image'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Uploaded</div>
                  <div className="text-sm">
                    {new Date(selectedImage.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedImage)}
                  disabled={deletingImageId === selectedImage.id}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info('Add to album - Coming soon');
                  }}
                  disabled={deletingImageId === selectedImage.id}
                >
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Add to Album
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info('Edit tags - Coming soon');
                  }}
                  disabled={deletingImageId === selectedImage.id}
                >
                  <Tag className="w-4 h-4 mr-1" />
                  Edit Tags
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedImage.id)}
                  disabled={deletingImageId === selectedImage.id}
                >
                  {deletingImageId === selectedImage.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
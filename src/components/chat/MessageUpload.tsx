import { useState } from 'react';
import { Image as ImageType } from '@/functions/api';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageGalleryModal } from './ImageGalleryModal';

interface MessageUploadProps {
  images: ImageType[];
  timestamp: string;
  projectId: string;
}

export const MessageUpload = ({ images, timestamp, projectId }: MessageUploadProps) => {
  const [showGallery, setShowGallery] = useState(false);
  const previewCount = 4;
  const hasMore = images.length > previewCount;
  const previewImages = images.slice(0, previewCount);

  return (
    <>
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] rounded-2xl bg-gradient-card p-4 shadow-md">
          <div className="text-xs text-muted-foreground mb-2">
            {new Date(timestamp).toLocaleString()}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            {previewImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowGallery(true)}
              >
                <img
                  src={image.thumbnailUrl || image.url}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
            </span>
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGallery(true)}
                className="text-primary hover:text-primary"
              >
                <Eye className="w-4 h-4 mr-1" />
                View all ({images.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      <ImageGalleryModal
        images={images}
        projectId={projectId}
        open={showGallery}
        onOpenChange={setShowGallery}
      />
    </>
  );
};

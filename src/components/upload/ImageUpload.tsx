import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileArchive, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { imagesApi } from '@/functions/projects';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  projectId: string;
  onUploadStart: () => void;
  onUploadProgress: (progress: number) => void;
  onUploadComplete: (images: any[]) => void;
  disabled?: boolean;
}

export const ImageUpload = ({
  projectId,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  disabled = false,
}: ImageUploadProps) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      if (!file.name.endsWith('.zip')) {
        toast.error('Please upload a ZIP file');
        return;
      }

      onUploadStart();
      try {
        const response = await imagesApi.uploadZip(projectId, file, (progress: number) => {
          onUploadProgress(progress);
        });

        const images = Array.isArray(response) ? response : [];
        toast.success(`Successfully uploaded ${images.length} images`);
        onUploadComplete(images);
      } catch (error) {
        toast.error('Upload failed. Please try again.');
      }
    },
    [projectId, onUploadStart, onUploadProgress, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
    },
    maxFiles: 1,
    disabled: disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
        isDragActive && !disabled
          ? 'border-primary bg-gradient-card'
          : 'border-muted-foreground/25 hover:border-primary hover:bg-gradient-card',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        {disabled ? (
          <>
            <FileArchive className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-sm text-muted-foreground">Uploading in progress...</p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold mb-1">
                {isDragActive ? 'Drop your ZIP file here' : 'Upload images to start culling'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload a .zip of photos or drag & drop
              </p>
            </div>
            <Button className="gradient-primary" disabled={disabled}>
              <FileArchive className="w-4 h-4 mr-2" />
              Upload ZIP
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
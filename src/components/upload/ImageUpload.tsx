import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileArchive, Sparkles, ImagePlus } from 'lucide-react';
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
        console.log('Upload response:', response);

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
        'relative overflow-hidden rounded-2xl transition-all duration-300',
        disabled && 'cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />

      {/* Animated background gradient */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 transition-opacity duration-300',
          isDragActive && !disabled ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Animated border */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl transition-all duration-300',
          isDragActive && !disabled
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            : 'ring-1 ring-border'
        )}
      />

      <div
        className={cn(
          'relative bg-card/50 backdrop-blur-sm p-10 transition-all duration-300',
          !disabled && 'cursor-pointer hover:bg-card/80',
          disabled && 'opacity-60'
        )}
      >
        {disabled ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-primary/10 rounded-full p-6">
                <FileArchive className="w-12 h-12 text-primary animate-bounce" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Processing your images...</h3>
              <p className="text-sm text-muted-foreground">
                This might take a moment
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Icon with animated glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <div
                className={cn(
                  'relative bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-8 transition-all duration-300',
                  isDragActive && 'scale-110 from-violet-500/20 to-fuchsia-500/20'
                )}
              >
                {isDragActive ? (
                  <ImagePlus className="w-16 h-16 text-primary" />
                ) : (
                  <Upload className="w-16 h-16 text-primary" />
                )}
              </div>
              {!isDragActive && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
                </div>
              )}
            </div>

            {/* Text content */}
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {isDragActive ? 'Drop it like it\'s hot! 🔥' : 'Upload Your Photo Collection'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? 'Release to upload your images'
                  : 'Drag and drop a ZIP file here, or click to browse'}
              </p>
            </div>

            {/* Upload button */}
            <Button
              size="lg"
              className={cn(
                'relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 transition-all duration-300',
                isDragActive && 'scale-105'
              )}
              disabled={disabled}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <FileArchive className="w-5 h-5 mr-2" />
              <span className="font-semibold">Choose ZIP File</span>
            </Button>

            {/* Format hint */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50">
                <FileArchive className="w-3 h-3" />
                <span>.zip</span>
              </div>
              <span>•</span>
              <span>Multiple images supported</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
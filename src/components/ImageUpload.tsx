import { useState, useRef } from "react";
import { Upload, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface ImageUploadProps {
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<void>;
}

export const ImageUpload = ({ onUpload }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      await onUpload(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="gradient-card border-border/50 shadow-soft">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-border/50 hover:border-primary transition-smooth"
            >
              <FileArchive className="mr-2 h-4 w-4" />
              Select ZIP File
            </Button>
            {selectedFile && (
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate">
                  {selectedFile.name}
                </span>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="gradient-primary text-primary-foreground hover:opacity-90 transition-smooth ml-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}

          {!selectedFile && !uploading && (
            <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-lg">
              <FileArchive className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Select a ZIP file containing your images
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported format: .zip
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

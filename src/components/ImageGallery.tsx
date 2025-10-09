import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Image as ImageIcon } from "lucide-react";

interface ImageGalleryProps {
  images: Array<{
    id: string;
    image_url: string;
    filename: string;
  }>;
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  if (images.length === 0) {
    return (
      <Card className="gradient-card border-border/50 shadow-soft">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No images yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload a ZIP file to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image) => (
        <Card
          key={image.id}
          className="gradient-card border-border/50 shadow-soft hover:shadow-hover transition-smooth overflow-hidden group animate-scale-in"
        >
          <div className="aspect-square relative">
            <img
              src={image.image_url}
              alt={image.filename}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-destructive hover:bg-white/20"
                onClick={() => {
                  // Placeholder for delete functionality
                  console.log('Delete image:', image.id);
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <CardContent className="p-2">
            <p className="text-xs text-muted-foreground truncate">
              {image.filename}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

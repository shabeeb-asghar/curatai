import React, { useState } from 'react';
import { Album } from '@/components/albums/AlbumsView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, User, X, Loader2, ZoomIn } from 'lucide-react';

export const AlbumDetailView = ({
  album,
  images,
  onBack,
  onDelete,
  onRemoveImage,
  isLoading
}: {
  album: Album;
  images: string[];
  onBack: () => void;
  onDelete: (albumId: string) => void;
  onRemoveImage: (index: number) => void;
  isLoading?: boolean;
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleDelete = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingIndex(index);
    await onRemoveImage(index);
    setDeletingIndex(null);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {album.person_name}
                </h2>
                <p className="text-sm text-gray-500">
                  {isLoading ? 'Loading...' : `${images.length} ${images.length === 1 ? 'photo' : 'photos'}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onDelete(album.id)}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Album
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading album images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <User className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No images in this album</p>
              <p className="text-gray-400 text-sm mt-1">Images will appear here once the album is created</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((imgUrl, index) => (
                <div
                  key={`${album.id}-${index}`}
                  className="group aspect-square bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer"
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img
                    src={imgUrl}
                    alt={`${album.person_name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 shadow-lg"
                      onClick={(e) => handleDelete(index, e)}
                      disabled={deletingIndex === index}
                    >
                      {deletingIndex === index ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={selectedImage}
              alt={album.person_name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
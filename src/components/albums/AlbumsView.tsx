import { useState, useEffect } from 'react';
import { albumsApi, imagesApi } from '@/functions/projects';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Cropper from 'react-easy-crop';
import { AlbumDetailView } from '@/components/albums/AlbumDetailView';
import { AlbumsGrid } from '@/components/albums/AlbumsGrid';
import { Plus, Loader2 } from 'lucide-react';
import getCroppedImg from '@/functions/projects';

export interface Album {
  id: string;
  created_at: string;
  project_id: string;
  person_name: string;
  image_group: string[];
}

export interface Image {
  id: string;
  created_at: string;
  image_url: string;
  project_id: string;
}

export interface AlbumsViewProps {
  projectId: string | null;
  isUploading: boolean;
}

const CreateAlbumDialog = ({
  open,
  onOpenChange,
  projectImages,
  onCreateAlbum,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectImages: Image[];
  onCreateAlbum: (personName: string, imageUrl: string, croppedArea: any) => Promise<void>;
  projectId: string | null;
}) => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [personName, setPersonName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCreate = async () => {
    if (!projectId || !selectedImage || !croppedAreaPixels || !personName.trim()) {
      toast.error('Please select an image and enter a person name');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateAlbum(personName, selectedImage.image_url, croppedAreaPixels);
      setIsCreating(false);
      setSelectedImage(null);
      setPersonName('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      toast.error('Failed to create album');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Album</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Person Name
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Enter person's name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Select Image
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
              {projectImages.map(img => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage?.id === img.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt="Project"
                    className="w-full aspect-square object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {selectedImage && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Crop Face
              </label>
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={selectedImage.image_url}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-[50px]">Zoom:</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="flex-1"
                  disabled={isCreating}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedImage(null);
              setPersonName('');
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedImage || !croppedAreaPixels || !personName.trim() || isCreating}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create Album
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export const AlbumsView = ({ projectId, isUploading }: AlbumsViewProps) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [projectImages, setProjectImages] = useState<Image[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingAlbumImages, setIsLoadingAlbumImages] = useState(false);

  useEffect(() => {
    // Clear previous state immediately when project changes
    setAlbums([]);
    setProjectImages([]);
    setSelectedAlbum(null);
    setAlbumImages([]);

    if (projectId) {
      loadAlbums();
      loadProjectImages();
    }
  }, [projectId]);

  const loadAlbums = async () => {
    if (!projectId) {
      setAlbums([]);
      return;
    }

    setAlbums([]);
    setIsLoadingAlbums(true);
    try {
      const data = await albumsApi.getAll(projectId);
      setAlbums(data);
    } catch (error) {
      //toast.error('Failed to load albums');
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  const loadProjectImages = async () => {
    if (!projectId) {
      setProjectImages([]);
      return;
    }

    setProjectImages([]);
    setIsLoadingImages(true);
    try {
      const data = await imagesApi.getProjectImages(projectId);
      setProjectImages(data);
    } catch (error) {
      toast.error('Failed to load project images');
    } finally {
      setIsLoadingImages(false);
    }
  };

  const loadAlbumImages = async (albumId: string) => {
    setIsLoadingAlbumImages(true);
    try {
      const { image_links } = await albumsApi.getAlbumImages(albumId);
      setAlbumImages(image_links);
    } catch (error) {
      toast.error('Failed to load album images');
      setAlbumImages([]);
    } finally {
      setIsLoadingAlbumImages(false);
    }
  };

  const handleCreateAlbum = async (personName: string, imageUrl: string, croppedArea: any) => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedArea);
      if (!croppedImage) {
        toast.error('Failed to crop image');
        return;
      }

      const albumIds = await albumsApi.generate(projectId, personName, croppedImage);
      toast.success(`Album created successfully for ${personName}`);
      await loadAlbums(); // Refresh albums list
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create album');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      await albumsApi.delete(albumId);
      setAlbums(albums.filter(a => a.id !== albumId));
      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(null);
        setAlbumImages([]);
        setViewMode('grid');
      }
      toast.success('Album deleted');
    } catch (error) {
      toast.error('Failed to delete album');
    }
  };

  const handleSelectAlbum = async (album: Album) => {
    setSelectedAlbum(album);
    setViewMode('detail');
    setAlbumImages([]);
    await loadAlbumImages(album.id);
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
    setTimeout(() => {
      setSelectedAlbum(null);
      setAlbumImages([]);
    }, 100);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = albumImages.filter((_, i) => i !== index);
    setAlbumImages(newImages);
    toast.success('Image removed');
    // TODO: Implement API call to update album
  };

  if (viewMode === 'grid' && isLoadingAlbums) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Albums</h2>
            <p className="text-gray-600 mt-1">Organize and manage your photo collections</p>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading albums...</p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedAlbum) {
    return (
      <AlbumDetailView
        album={selectedAlbum}
        images={albumImages}
        onBack={handleBackToGrid}
        onDelete={handleDeleteAlbum}
        onRemoveImage={handleRemoveImage}
        isLoading={isLoadingAlbumImages}
      />
    );
  }

  return (
    <>
      <AlbumsGrid
        albums={albums}
        onSelectAlbum={handleSelectAlbum}
        onDeleteAlbum={handleDeleteAlbum}
        onCreateAlbum={() => setIsCreateDialogOpen(true)}
      />
      <CreateAlbumDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectImages={projectImages}
        onCreateAlbum={handleCreateAlbum}
        projectId={projectId}
      />
    </>
  );
};
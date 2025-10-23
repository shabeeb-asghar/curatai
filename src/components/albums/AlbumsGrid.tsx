import { Album } from '@/components/albums/AlbumsView';
import { AlbumCard } from '@/components/albums/AlbumCard';
import { Button } from '@/components/ui/button';
import { Plus, Users, Sparkles } from 'lucide-react';

export const AlbumsGrid = ({ 
  albums, 
  onSelectAlbum, 
  onDeleteAlbum,
  onCreateAlbum 
}: { 
  albums: Album[];
  onSelectAlbum: (album: Album) => void;
  onDeleteAlbum: (albumId: string) => void;
  onCreateAlbum: () => void;
}) => {
  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Albums</h2>
            <p className="text-gray-600 mt-1">Organize and manage your photo collections</p>
          </div>
          {albums.length > 0 && (
            <Button onClick={onCreateAlbum}>
              <Plus className="w-4 h-4 mr-2" />
              Create Album
            </Button>
          )}
        </div>

        {albums.length === 0 ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center max-w-md">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Create Your First Album
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Albums help you organize photos by person. Select a face from your images, 
                give it a name, and start building your collection.
              </p>
              
              <Button 
                onClick={onCreateAlbum}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Album
              </Button>
              
              <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-gray-600">Select a photo</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-3xl mb-2">✂️</div>
                  <p className="text-gray-600">Crop the face</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-gray-600">Name & create</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map(album => (
              <AlbumCard
                key={album.id}
                album={album}
                onSelect={onSelectAlbum}
                onDelete={onDeleteAlbum}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
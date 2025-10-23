import { Album } from '@/components/albums/AlbumsView';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import { Trash2 } from 'lucide-react';


export const AlbumCard = ({ album, onSelect, onDelete }: { 
  album: Album; 
  onSelect: (album: Album) => void;
  onDelete: (albumId: string) => void;
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200">
      <div
        onClick={() => onSelect(album)}
        className="cursor-pointer"
      >
        <div className="aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
          <div className="text-white text-6xl font-bold">
            {getInitials(album.person_name)}
          </div>
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {album.image_group?.length || 0} photos
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {album.person_name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Created {new Date(album.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Button
          onClick={() => onDelete(album.id)}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Album
        </Button>
      </div>
    </div>
  );
};
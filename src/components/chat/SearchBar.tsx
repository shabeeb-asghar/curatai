import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Plus, Send, Upload, Folder, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { imagesApi, albumsApi } from '@/functions/projects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

interface Album {
  id: string;
  created_at: string;
  project_id: string;
  person_name: string;
  image_group: string[];
}

interface SearchBarProps {
  onSearch: (query: string, imageLinks: string[]) => void;
  onUploadStart: () => void;
  onUploadProgress: (progress: number) => void;
  onUploadComplete: (images: any[]) => void;
  projectId: string | null;
  disabled?: boolean;
}

export const SearchBar = ({
  onSearch,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  projectId,
  disabled = false,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsRecording(false);
        handleSearch(transcript); // Automatically trigger search after voice input
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition failed. Please try again.');
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Load albums when projectId changes
    if (projectId) {
      loadAlbums();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [projectId]);

  const loadAlbums = async () => {
    if (!projectId) return;
    setIsLoadingAlbums(true);
    try {
      const data = await albumsApi.getAll(projectId);
      setAlbums(data);
    } catch (error: any) {
      console.error('Failed to load albums:', error);
      toast.error(error.response?.data?.message || 'Failed to load albums. Please try again.');
      setAlbums([]);
    } finally {
      setIsLoadingAlbums(false);
    }
  };
  const toggleRecording = () => {
  if (!recognitionRef.current) {
    toast.error('Voice recognition is not supported in your browser');
    return;
  }

  if (isRecording) {
    recognitionRef.current.stop();
    setIsRecording(false);
  } else {
    recognitionRef.current.start();
    setIsRecording(true);
    toast.info('Listening... Speak now');
  }
};

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim() || !projectId) return;

    setIsSearching(true);
    try {
      let imageLinks: string[] = [];
      // Check if query includes album filter
      const albumMatch = searchQuery.match(/in album: (\S+)/i);
      if (albumMatch) {
        const albumName = albumMatch[1];
        const album = albums.find(
          a => a.person_name.toLowerCase() === albumName.toLowerCase()
        );
        if (album) {
          // Fetch images for the album
          const albumData = await albumsApi.getAlbumImages(album.id);
          imageLinks = albumData.image_links;
          if (imageLinks.length === 0) {
            toast.info(`No images found in album "${album.person_name}".`);
          }
        } else {
          toast.error(`Album "${albumName}" not found.`);
          imageLinks = [];
        }
      } else {
        // Perform regular search
        const response = await imagesApi.searchImages(projectId, searchQuery);
        imageLinks = response.result.image_links;
        if (imageLinks.length === 0) {
          toast.info('No images found for your query.');
        }
      }
      onSearch(searchQuery, imageLinks);
      // Only clear query for non-album searches
      if (!albumMatch) {
        setQuery('');
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      toast.error(error.response?.data?.message || 'Search failed. Please try again.');
      onSearch(searchQuery, []);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !projectId) return;

    const file = acceptedFiles[0];
    if (!file.name.endsWith('.zip')) {
      toast.error('Please upload a ZIP file');
      return;
    }

    onUploadStart();
    try {
      const response = await imagesApi.uploadZip(projectId, file, onUploadProgress);
      const images = Array.isArray(response) ? response : [];
      toast.success(`Successfully uploaded ${images.length} images`);
      onUploadComplete(images);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const { open: openFileDialog } = useDropzone({ onDrop, noClick: true, noKeyboard: true });

  const handleSelectAlbum = (albumName: string) => {
    setQuery(prev => `${prev} ${albumName}`.trim());
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            disabled={disabled || isSearching}
            className="flex-shrink-0 hover:gradient-card transition-smooth"
            aria-label="Actions"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => openFileDialog()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Folder className="w-4 h-4 mr-2" />
              Select Album
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {isLoadingAlbums ? (
                <DropdownMenuItem disabled>Loading albums...</DropdownMenuItem>
              ) : albums.length === 0 ? (
                <DropdownMenuItem disabled>No albums available</DropdownMenuItem>
              ) : (
                albums.map(album => (
                  <DropdownMenuItem
                    key={album.id}
                    onClick={() => handleSelectAlbum(album.person_name)}
                  >
                    {album.person_name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search images... (e.g., 'all photos with John smiling')"
          disabled={disabled || isSearching}
          className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={toggleRecording}
          disabled={disabled || isSearching}
          className={isRecording ? 'text-destructive' : ''}
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleSearch()}
          disabled={disabled || isSearching || !query.trim()}
          aria-label="Search"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
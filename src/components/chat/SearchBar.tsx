import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCreateAlbum: () => void;
  disabled?: boolean;
}

export const SearchBar = ({ onSearch, onCreateAlbum, disabled = false }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Button
          size="icon"
          variant="outline"
          onClick={onCreateAlbum}
          disabled={disabled}
          className="flex-shrink-0 hover:gradient-card transition-smooth"
          aria-label="Create album"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <div className="flex-1 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search images... (e.g., 'all photos with John smiling')"
            disabled={disabled}
            className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleRecording}
            disabled={disabled}
            className={isRecording ? 'text-destructive' : ''}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleSearch}
            disabled={disabled || !query.trim()}
            aria-label="Search"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

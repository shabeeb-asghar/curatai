import { useState, useEffect, useRef } from 'react';
import { Image as ImageType, imagesApi } from '@/functions/projects';
import { MessageUpload } from './MessageUpload';
import { MessageAI } from './MessageAI';
import { ImageUpload } from '../upload/ImageUpload';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'upload' | 'ai';
  content?: string;
  images?: ImageType[];
  timestamp: string;
  isLoading?: boolean;
}

interface MainChatAreaProps {
  projectId: string | null;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadProgress: (progress: number) => void;
  onUploadComplete: () => void;
}

export const MainChatArea = ({
  projectId,
  isUploading,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
}: MainChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      loadImages();
    } else {
      setMessages([]);
    }
  }, [projectId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollAreaRef.current && messages.length > 0) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const loadImages = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const images = await imagesApi.getProjectImages(projectId);
      if (images.length > 0) {
        const uploadMessage: Message = {
          id: `upload-${Date.now()}`,
          type: 'upload',
          images,
          timestamp: new Date().toISOString(),
        };
        setMessages([uploadMessage]);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      toast.error('Failed to load project images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = async (images: ImageType[]) => {
    if (!projectId) return;

    try {
      if (images.length > 0) {
        const newMessage: Message = {
          id: `upload-${Date.now()}`,
          type: 'upload',
          images,
          timestamp: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
      // Refresh images from server to include facial recognition results
      await loadImages();
    } catch (error) {
      console.error('Error handling upload completion:', error);
      toast.error('Failed to process uploaded images');
    } finally {
      onUploadComplete();
    }
  };

  // No project selected
  if (!projectId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold gradient-text mb-2">
            Welcome to Photo Culling
          </h2>
          <p className="text-muted-foreground mb-6">
            Select a project from the sidebar or create a new one to get started
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading images...</p>
        </div>
      </div>
    );
  }

  // No messages: Show ImageUpload in the center
  if (messages.length === 0 && !isUploading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-3xl font-bold gradient-text mb-2">Upload images</h2>
          <p className="text-muted-foreground mb-6">
            Upload a .zip of photos to start culling and organizing
          </p>
          <ImageUpload
            projectId={projectId}
            onUploadStart={onUploadStart}
            onUploadProgress={onUploadProgress}
            onUploadComplete={handleUploadComplete}
            disabled={isUploading}
          />
        </div>
      </div>
    );
  }

  // Messages exist: Show ScrollArea with messages and ImageUpload at the bottom
  return (
    <div className="flex-1 flex flex-col h-full">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto p-6 space-y-4 min-h-full">
          {messages.map((message) => {
            if (message.type === 'upload' && message.images) {
              return (
                <MessageUpload
                  key={message.id}
                  images={message.images}
                  timestamp={message.timestamp}
                  projectId={projectId}
                />
              );
            }
            if (message.type === 'ai') {
              return (
                <MessageAI
                  key={message.id}
                  content={message.content}
                  isLoading={message.isLoading}
                  timestamp={message.timestamp}
                />
              );
            }
            return null;
          })}
        </div>
      </ScrollArea>
      <div className="border-t p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <ImageUpload
            projectId={projectId}
            onUploadStart={onUploadStart}
            onUploadProgress={onUploadProgress}
            onUploadComplete={handleUploadComplete}
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
};
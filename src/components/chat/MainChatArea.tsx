import { useState, useEffect, useRef } from 'react';
import { Image as ImageType, imagesApi } from '@/functions/projects';
import { SearchBar } from './SearchBar';
import { MessageUpload } from './MessageUpload';
import { MessageAI } from './MessageAI';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'upload' | 'user' | 'ai';
  content?: string;
  images?: ImageType[] | string[]; // Support both ImageType[] for uploads and string[] for search results
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear messages whenever project changes
    setMessages([]);
    if (projectId) {
      loadImages();
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
    } catch (error: any) {
      console.error('Failed to load images:', error);
      toast.error(error.response?.data?.message || 'Failed to load project images');
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
        setMessages([newMessage]);
      }
      await loadImages();
    } catch (error: any) {
      console.error('Error handling upload completion:', error);
      toast.error(error.response?.data?.message || 'Failed to process uploaded images');
    } finally {
      onUploadComplete();
    }
  };

  const handleSearch = (query: string, imageLinks: string[]) => {
    // Add user query as a message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    // Add AI response with search results
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      images: imageLinks,
      content: imageLinks.length > 0 ? `Found ${imageLinks.length} image${imageLinks.length === 1 ? '' : 's'} for "${query}"` : `No images found for "${query}"`,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
  };

  const clearResults = () => {
    setMessages(messages.filter(msg => msg.type !== 'user' && msg.type !== 'ai'));
  };

  // No project selected
  if (!projectId) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <SearchBar
            onSearch={handleSearch}
            onUploadStart={onUploadStart}
            onUploadProgress={onUploadProgress}
            onUploadComplete={handleUploadComplete}
            projectId={projectId}
            disabled={true}
          />
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium">No Project Selected</p>
            <p className="text-sm mt-2">Select a project to search images</p>
          </div>
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

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      </div>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto p-6 space-y-4 min-h-full">
          {messages.length === 0 && !isUploading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center max-w-md px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-violet-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Search Your Images</h3>
                <p className="text-sm leading-relaxed">
                  Use natural language to find your photos. Try queries like:
                </p>
                <div className="mt-4 space-y-2 text-sm text-left bg-muted/50 rounded-lg p-4">
                  <p>• "All photos with John smiling"</p>
                  <p>• "Show me beach pictures"</p>
                  <p>• "Images from the wedding"</p>
                  <p>• "Photos with Sarah in album: Family"</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              // if (message.type === 'upload' && message.images) {
              //   return (
              //     <MessageUpload
              //       key={message.id}
              //       images={message.images as ImageType[]}
              //       timestamp={message.timestamp}
              //       projectId={projectId}
              //     />
              //   );
              // }
              if (message.type === 'user') {
                return (
                  <div key={message.id} className="flex justify-end mb-4">
                    <div className="max-w-[80%] rounded-2xl bg-gradient-card p-4 shadow-md">
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(message.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm text-foreground">{message.content}</div>
                    </div>
                  </div>
                );
              }
              if (message.type === 'ai') {
                return (
                  <div key={message.id} className="flex justify-start mb-4">
                    <div className="max-w-[80%] rounded-2xl bg-card border p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium gradient-text">Search Results</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {message.isLoading ? (
                        <div className="space-y-2">
                          <div className="animate-pulse h-4 w-full bg-muted rounded"></div>
                          <div className="animate-pulse h-4 w-3/4 bg-muted rounded"></div>
                          <div className="animate-pulse h-4 w-5/6 bg-muted rounded"></div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-foreground mb-2">{message.content}</div>
                          {message.images && message.images.length > 0 && (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                                {(message.images as string[]).map((imageUrl, index) => (
                                  <div
                                    key={`${imageUrl}-${index}`}
                                    className="group aspect-square bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer"
                                    onClick={() => setSelectedImage(imageUrl)}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Search result ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                      <ZoomIn className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Button onClick={clearResults} variant="outline" size="sm">
                                <X className="w-4 h-4 mr-2" />
                                Clear Results
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
      </ScrollArea>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Full size"
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
              <SearchBar
          onSearch={handleSearch}
          onUploadStart={onUploadStart}
          onUploadProgress={onUploadProgress}
          onUploadComplete={handleUploadComplete}
          projectId={projectId}
          disabled={isUploading}
        />
    </div>
  );
};
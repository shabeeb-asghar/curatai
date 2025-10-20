import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageAIProps {
  content?: string;
  isLoading?: boolean;
  timestamp?: string;
}

export const MessageAI = ({ content, isLoading = false, timestamp }: MessageAIProps) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] rounded-2xl bg-card border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium gradient-text">AI Assistant</span>
          {timestamp && (
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(timestamp).toLocaleString()}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {content || 'Processing your request...'}
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { Images, MessageSquare, FolderHeart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AllImages } from '@/components/chat/AllImages';
import { MainChatArea } from './chat/MainChatArea';
import { AlbumsView } from './albums/AlbumsView';

interface NavigationTabsProps {
  selectedProjectId: string | null;
  isUploading: boolean;
  handleUploadStart: () => void;
  handleUploadProgress: (progress: number) => void;
  handleUploadComplete: () => void;
}

export const NavigationTabs = ({
  selectedProjectId,
  isUploading,
  handleUploadStart,
  handleUploadProgress,
  handleUploadComplete,
}: NavigationTabsProps) => {
  const [currentTab, setCurrentTab] = useState<'all-images' | 'chat' | 'albums'>('all-images');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const tabs = [
    { id: 'all-images', label: 'All Images', icon: Images },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'albums', label: 'Albums', icon: FolderHeart },
  ] as const;

  useEffect(() => {
    const activeTab = tabRefs.current[currentTab];
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [currentTab]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Modern Tab Navigation */}
      <div className="relative border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative flex justify-center items-center gap-1 p-2">
          {/* Animated background indicator */}
          <div
            className="absolute bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-xl transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              height: 'calc(100% - 16px)',
              top: '8px',
            }}
          />

          {/* Animated bottom line indicator */}
          <div
            className="absolute bottom-2 h-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left + indicatorStyle.width / 2 - 24}px`,
              width: '48px',
            }}
          />

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const isDisabled = isUploading || !selectedProjectId;

            return (
              <button
                key={tab.id}
                ref={(el) => (tabRefs.current[tab.id] = el)}
                onClick={() => !isDisabled && setCurrentTab(tab.id)}
                disabled={isDisabled}
                className={cn(
                  'relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors duration-200',
                  'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  'z-10',
                  isActive && 'text-primary',
                  !isActive && !isDisabled && 'text-muted-foreground hover:text-foreground',
                  isDisabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                {/* Icon and label */}
                <Icon className="w-5 h-5" />
                <span className="text-sm">{tab.label}</span>

                {/* Loading indicator */}
                {isActive && isUploading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </button>
            );
          })}
        </div>

        {/* Subtle gradient line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentTab === 'all-images' && (
          <AllImages
            projectId={selectedProjectId}
            isUploading={isUploading}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
          />
        )}
        {currentTab === 'chat' && (
          <MainChatArea
            projectId={selectedProjectId}
            isUploading={isUploading}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
          />
        )}
        {currentTab === 'albums' && (
          <AlbumsView
            projectId={selectedProjectId}
            isUploading={isUploading}
          />
        )}
      </div>
    </div>
  );
};
import { Project } from '@/functions/projects';
import { FolderIcon, Clock, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean; // Added disabled prop
}

export const ProjectCard = ({ project, isSelected, onClick, disabled = false }: ProjectCardProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date parsing error:', dateString, error);
      return 'Invalid Date';
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg p-3 transition-all',
        isSelected
          ? 'gradient-card shadow-md ring-1 ring-primary/20'
          : 'hover:bg-sidebar-accent',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={disabled ? undefined : onClick} // Disable click when disabled
      role="button"
      tabIndex={disabled ? -1 : 0} // Disable keyboard focus when disabled
      onKeyDown={(e) => {
        if (disabled) return; // Prevent keyboard interactions when disabled
        if (e.key === 'Enter') onClick();
      }}
      aria-label={`Open project ${project.project_name || 'Untitled Project'}`}
      aria-disabled={disabled} // Improve accessibility
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
          <FolderIcon className="w-6 h-6 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-medium text-sm break-words mb-1">
                  {project.project_name || 'Untitled Project'}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{project.project_name || 'Untitled Project'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {project.image_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(project.updated_at || project.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
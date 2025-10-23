import React from 'react';
import { Folder, Clock, Image, ChevronRight } from 'lucide-react';

// Utility function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface Project {
  project_name: string | null;
  image_count: number;
  updated_at: string | null;
  created_at: string | null;
}

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
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
        'group relative rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer border',
        'hover:shadow-md',
        isSelected
          ? 'bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/40 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-700/60 hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-slate-800/50',
        disabled && 'opacity-50 cursor-not-allowed hover:shadow-none'
      )}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Open project ${project.project_name || 'Untitled Project'}`}
      aria-disabled={disabled}
    >
      <div className="relative flex items-center gap-2.5">
        {/* Icon container - compact */}
        <div className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 flex-shrink-0',
          isSelected
            ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/10'
            : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-500/10'
        )}>
          <Folder className={cn(
            'w-4.5 h-4.5 transition-colors duration-200',
            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
          )} />
        </div>

        {/* Content - compact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <h3 className={cn(
              'font-medium text-sm leading-tight truncate transition-colors duration-200',
              isSelected ? 'text-slate-900 dark:text-slate-50' : 'text-slate-800 dark:text-slate-100'
            )}>
              {project.project_name || 'Untitled Project'}
            </h3>
           
          </div>

          {/* Stats - compact inline */}
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Image className="w-3 h-3" />
              <span>{project.image_count || 0}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(project.updated_at || project.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-500/50 to-transparent dark:from-blue-400 dark:via-blue-400/50" />
      )}
    </div>
  );
};
export default ProjectCard;
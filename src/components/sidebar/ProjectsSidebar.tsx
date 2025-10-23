import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Trash2, LogOut, Folder, Sparkles, Loader2 } from 'lucide-react';
import { projectsApi } from '@/functions/projects';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project } from '@/functions/projects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ProjectCard } from './ProjectCard';
import { cn } from '@/lib/utils';

interface ProjectsSidebarProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  userId: string;
  disabled?: boolean;
  onProjectsLoadingChange?: (isLoading: boolean) => void;
}

export const ProjectsSidebar = ({
  selectedProjectId,
  onSelectProject,
  userId,
  disabled = false,
  onProjectsLoadingChange,
}: ProjectsSidebarProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (!userId) {
      toast.error('User ID not found. Please log in.');
      return;
    }

    setIsProjectsLoading(true);
    onProjectsLoadingChange?.(true);
    try {
      const data = await projectsApi.getAll(userId);
      console.log('Projects loaded:', data);
      setProjects(data);
    } catch (error) {
      //toast.error('Failed to load projects');
    } finally {
      setIsProjectsLoading(false);
      onProjectsLoadingChange?.(false);
    }
  };

  const handleCreateProject = async () => {
    if (disabled) {
      toast.error('Please wait until the upload is complete');
      return;
    }

    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (!userId) {
      toast.error('User ID not found. Please log in.');
      return;
    }

    setIsCreating(true);
    try {
      const response = await projectsApi.create(newProjectName, userId);
      await loadProjects();
      setNewProjectName('');
      setIsCreateDialogOpen(false);
      onSelectProject(response.project_id);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (disabled) {
      toast.error('Please wait until the upload is complete');
      return;
    }

    setDeletingProjectId(projectId);
    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      if (selectedProjectId === projectId) {
        onSelectProject('');
      }
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleLogout = () => {
    if (disabled) {
      toast.error('Please wait until the upload is complete');
      return;
    }
    try {
      localStorage.clear();
      window.location.href = '/';
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <>
      <div className="w-72 border-r bg-gradient-to-b from-background via-background to-muted/20 flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Folder className="w-5 h-5 text-violet-600" />
                <Sparkles className="w-3 h-3 text-fuchsia-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Projects
              </h2>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(true)}
              aria-label="Create new project"
              className={cn(
                "rounded-full hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-fuchsia-500/10 transition-all duration-300",
                !disabled && "hover:scale-110"
              )}
              disabled={disabled || isCreating}
            >
              <Plus className={cn("w-5 h-5", !disabled && "group-hover:rotate-90 transition-transform")} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        {/* Projects List */}
        <ScrollArea className="flex-1 px-3 py-4">
          {isProjectsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl" />
                <div className="relative bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-6">
                  <Folder className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first project to get started
              </p>
              <Button
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                disabled={disabled}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="group relative"
                  tabIndex={disabled ? -1 : 0}
                  role="button"
                  aria-label={`Open project ${project.project_name}`}
                  onKeyDown={(e) => {
                    if (disabled || deletingProjectId === project.id) return;
                    if (e.key === 'Enter') {
                      onSelectProject(project.id);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = document.querySelector(
                        `[data-project-index="${index + 1}"]`
                      ) as HTMLElement;
                      next?.focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prev = document.querySelector(
                        `[data-project-index="${index - 1}"]`
                      ) as HTMLElement;
                      prev?.focus();
                    }
                  }}
                  data-project-index={index}
                >
                  <ProjectCard
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onClick={() => {
                      if (!disabled && deletingProjectId !== project.id) {
                        onSelectProject(project.id);
                      }
                    }}
                    disabled={disabled || deletingProjectId === project.id}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full hover:bg-muted"
                          onClick={(e) => e.stopPropagation()}
                          disabled={disabled || deletingProjectId === project.id}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                          disabled={disabled || deletingProjectId === project.id}
                        >
                          {deletingProjectId === project.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 shrink-0 bg-muted/30">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 transition-all duration-300",
              "hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-fuchsia-500/10",
              "hover:border-violet-500/50"
            )}
            onClick={handleLogout}
            disabled={disabled}
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Create New Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-medium">
                Project Name
              </Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Amazing Project"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isCreating && !disabled) {
                    handleCreateProject();
                  }
                }}
                autoFocus
                disabled={isCreating || disabled}
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating || disabled}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isCreating || disabled || !newProjectName.trim()}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
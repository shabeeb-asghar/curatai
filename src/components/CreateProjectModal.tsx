"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateProjectModalProps {
  onCreateProject: (name: string) => Promise<void>
}

export const CreateProjectModal = ({ onCreateProject }: CreateProjectModalProps) => {
  const [open, setOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim()) return

    setIsLoading(true)
    try {
      await onCreateProject(projectName.trim())
      setProjectName("")
      setOpen(false)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gradient-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-soft"
          aria-label="Create new project"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Give your project a name to get started with organizing your photos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Photo Collection"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="border-border/50 focus:border-primary transition-smooth"
                autoFocus
                aria-required="true"
                aria-invalid={!projectName.trim() ? "true" : "false"}
              />
              <p className="text-xs text-muted-foreground">You can rename your project later from settings.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!projectName.trim() || isLoading}
              className="gradient-primary text-primary-foreground hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

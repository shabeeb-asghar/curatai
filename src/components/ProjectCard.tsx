"use client"

import type React from "react"

import { Calendar, ImageIcon, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProjectCardProps {
  id: string
  name: string
  imageCount: number
  createdAt: string
  onOpen: () => void
  onDelete: () => void
}

export const ProjectCard = ({ id, name, imageCount, createdAt, onOpen, onDelete }: ProjectCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleKeyOpen = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onOpen()
    }
  }

  return (
    <Card
      data-id={id}
      onClick={onOpen}
      onKeyDown={handleKeyOpen}
      role="button"
      tabIndex={0}
      aria-label={`Open project ${name}`}
      className="gradient-card border-border/50 shadow-soft hover:shadow-hover transition-smooth hover:scale-[1.02] animate-fade-in group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative h-32 sm:h-36 w-full overflow-hidden rounded-t-xl">
        <img
          src="/project-preview-image.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-xs text-foreground backdrop-blur-md border border-border/60">
          <ImageIcon className="h-3.5 w-3.5" />
          <span className="font-medium">{imageCount}</span>
          <span className="text-muted-foreground">{imageCount === 1 ? "image" : "images"}</span>
        </div>
        <div className="absolute right-3 bottom-3 rounded-full bg-background/70 px-2 py-1 text-xs text-muted-foreground backdrop-blur-md border border-border/60 inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between w-full">
          <CardTitle className="text-xl font-semibold text-foreground line-clamp-1">{name}</CardTitle>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-smooth opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Delete project ${name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{name}"? This action cannot be undone and will delete all images in
                  this project.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          Curate and manage your photo collection with quick access and clean organization.
        </p>
      </CardContent>

      <CardFooter>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-smooth font-medium"
          aria-label={`Open project ${name}`}
        >
          Open Project
        </Button>
      </CardFooter>
    </Card>
  )
}

import { Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const AISearchPanel = () => {
  return (
    <Card className="gradient-card border-border/50 shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Search
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 min-h-[200px]">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 bg-card rounded-lg p-3 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Welcome! Soon you'll be able to search your photos using natural language.
                Try queries like "sunset photos" or "images with people smiling"
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your photos..."
            className="border-border/50 focus:border-primary transition-smooth"
            disabled
          />
          <Button
            disabled
            className="gradient-primary text-primary-foreground hover:opacity-90 transition-smooth"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          AI-powered search will help you find images based on content, objects, and context
        </p>
      </CardContent>
    </Card>
  );
};

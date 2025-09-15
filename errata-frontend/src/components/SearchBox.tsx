import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  className?: string;
}

const loadingStates = [
  "Fetching...",
  "Analyzing...", 
  "Processing...",
  "Finding solution...",
  "Cross-referencing...",
  "Finalizing..."
];

const SearchBox = ({ onSearch, isLoading, className }: SearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      // Cycle through loading states
      const interval = setInterval(() => {
        setCurrentLoadingIndex((prev) => (prev + 1) % loadingStates.length);
      }, 800);
      
      setTimeout(() => clearInterval(interval), 4000); // Clear after 4 seconds
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Paste your error code, error message, or describe the issue you're experiencing..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[120px] text-lg bg-surface/50 backdrop-blur border-border/50 focus:border-primary resize-none pr-16"
            disabled={isLoading}
          />
          <div className="absolute bottom-4 right-4">
            <Button
              type="submit"
              size="sm"
              variant="cyber"
              disabled={!query.trim() || isLoading}
              className="relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="animate-fade-in">
                    {loadingStates[currentLoadingIndex]}
                  </span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
      
      {/* Minimalistic graph animation background */}
      {isLoading && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-primary/20 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-accent/30 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
        </div>
      )}
    </div>
  );
};

export default SearchBox;
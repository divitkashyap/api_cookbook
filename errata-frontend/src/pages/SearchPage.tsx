import { useState, useEffect } from "react";
import { Search, Filter, Code, AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import SearchBox from "@/components/SearchBox";
import { useSearchErrors, useAllErrors } from "@/hooks/useErrors";
import { Alert } from "@/components/ui/alert";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAPI, setSelectedAPI] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Use real API data with enhanced search
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError
  } = useSearchErrors(searchQuery, currentPage, selectedAPI);

  const {
    data: allErrorsData,
    isLoading: isLoadingAll,
    error: allErrorsError
  } = useAllErrors(currentPage, selectedAPI, selectedSeverity);

  // Use search results if searching, otherwise show all errors
  const isSearchMode = searchQuery.length > 0;
  const currentData = isSearchMode ? searchData : allErrorsData;
  const isLoading = isSearchMode ? isSearching : isLoadingAll;
  const error = isSearchMode ? searchError : allErrorsError;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleAPIChange = (api: string) => {
    setSelectedAPI(api);
    setCurrentPage(1); // Reset pagination when changing filters
  };

  const handleSeverityChange = (severity: string) => {
    setSelectedSeverity(severity);
    setCurrentPage(1);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-destructive bg-destructive/20";
      case "error": return "text-warning bg-warning/20";
      case "warning": return "text-accent bg-accent/20";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return AlertCircle;
      case "error": return AlertCircle;
      case "warning": return Clock;
      default: return CheckCircle;
    }
  };

  // Fix: Use .data instead of .errors
  const filteredErrors = currentData?.errors || [];

  return (
    <div className="min-h-screen pt-24 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className={cn(
          "mb-8 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <h1 className="text-4xl font-bold mb-4 font-jakarta">
            Error Code <span className="text-primary">Search</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover solutions to API errors with our intelligent search system
          </p>
          
          <SearchBox 
            onSearch={handleSearch}
            isLoading={isLoading}
            className="mb-8"
          />
        </div>

        {/* Filters */}
        <div className={cn(
          "mb-8 space-y-4 transition-all duration-700 delay-200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedAPI} onValueChange={handleAPIChange}>
              <SelectTrigger className="w-full sm:w-[200px] bg-surface/50 backdrop-blur">
                <SelectValue placeholder="Select API" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All APIs</SelectItem>
                <SelectItem value="Stripe">Stripe</SelectItem>
                <SelectItem value="GitHub">GitHub</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSeverity} onValueChange={handleSeverityChange}>
              <SelectTrigger className="w-full sm:w-[200px] bg-surface/50 backdrop-blur">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="bg-surface/50 backdrop-blur">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center py-12 bg-gradient-surface border-border/50">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="mb-2 text-destructive">Error Loading Data</CardTitle>
              <CardDescription>
                Failed to connect to the API. Please check your backend is running.
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <div className={cn(
            "space-y-6 transition-all duration-700 delay-400",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Found {currentData?.total || 0} error{(currentData?.total || 0) !== 1 ? 's' : ''}
                {currentData?.pages && currentData.pages > 1 && (
                  <span> (Page {currentData.page} of {currentData.pages})</span>
                )}
              </p>
            </div>

            {filteredErrors.map((error, index) => {
              // Safety check for error properties
              if (!error?.code) return null;
              
              const SeverityIcon = AlertCircle; // Default icon
              
              return (
                <Card 
                  key={error.id || index}
                  className={cn(
                    "hover-lift hover-glow bg-gradient-surface border-border/50 transition-all duration-500",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          getSeverityColor(error.severity || 'info')
                        )}>
                          <SeverityIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-jakarta flex items-center space-x-2">
                            <span>{error.code}</span>
                            <Badge variant="outline" className="bg-surface/50">
                              Stripe
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-1">
                            <span>Stripe API</span>
                            {error.severity && (
                              <>
                                <span>•</span>
                                <span>Severity: {error.severity}</span>
                              </>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    <Badge className={getSeverityColor(error.severity || 'info')}>
                    {error.severity || 'info'}
                    </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-foreground">Description</h4>
                      <p className="text-muted-foreground">{error.description || 'No description available'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-success">Solution</h4>
                      <p className="text-muted-foreground">{error.message || 'Check Stripe documentation for solutions'}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Button variant="cyber" size="sm">
                        <Code className="h-4 w-4 mr-2" />
                        View Code Examples
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Stripe Docs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {!isLoading && filteredErrors.length === 0 && (
              <Card className="text-center py-12 bg-gradient-surface border-border/50">
                <CardContent>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">No results found</CardTitle>
                  <CardDescription>
                    Try adjusting your search terms or filters
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
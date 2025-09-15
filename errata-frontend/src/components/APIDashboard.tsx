import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService, APIStats } from '@/services/api';
import stripeErrors from '@/data/stripe-errors.json';
import { Loader2, Database, AlertTriangle, Code, GitBranch, CreditCard } from 'lucide-react';

// Helper function to infer category from error code
const inferCategory = (code: string): string => {
  if (!code) return 'General';
  
  if (code.includes('authentication') || code.includes('invalid_key')) return 'Authentication';
  if (code.includes('card') || code.includes('payment')) return 'Payment';
  if (code.includes('parameter') || code.includes('missing')) return 'Validation';
  if (code.includes('rate_limit')) return 'Rate Limiting';
  if (code.includes('webhook')) return 'Webhooks';
  if (code.includes('resource')) return 'Resource';
  
  return 'General';
};

const APIDashboard: React.FC = () => {
  const [stats, setStats] = useState<APIStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('APIDashboard: Processing stripe errors from JSON');
        
        // Filter and deduplicate the same way as the useErrors hook
        const stripeOnly = stripeErrors.filter((error: any) => 
          error.code && !error.code.includes('github') && !error.code.includes('_github_')
        );
        
        // Deduplicate by error code to get unique errors only
        const uniqueStripeErrors = stripeOnly.reduce((acc: any[], error: any) => {
          if (!acc.find(e => e.code === error.code)) {
            acc.push(error);
          }
          return acc;
        }, []);
        
        console.log('APIDashboard: Unique Stripe errors count:', uniqueStripeErrors.length);
        
        const stripeCategories = [...new Set(uniqueStripeErrors.map((error: any) => 
          error.category || inferCategory(error.code || '')
        ))].filter(Boolean) as string[];
        
        console.log('APIDashboard: Categories:', stripeCategories);
        
        const localStats: APIStats[] = [
          {
            name: 'Stripe',
            errorCount: uniqueStripeErrors.length,
            categories: stripeCategories
          }
        ];
        
        console.log('APIDashboard: Setting stats:', localStats);
        setStats(localStats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load API statistics');
        console.error('Error loading API stats:', err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading API statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  const totalErrors = stats.reduce((sum, api) => sum + api.errorCount, 0);
  const totalAPIs = stats.length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAPIs}</div>
            <p className="text-xs text-muted-foreground">
              APIs in our cookbook
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Patterns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Documented error patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reduce((sum, api) => sum + api.categories.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Error categories covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((api) => (
          <Card key={api.name} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {api.name === 'GitHub' ? (
                    <GitBranch className="h-5 w-5" />
                  ) : api.name === 'Stripe' ? (
                    <CreditCard className="h-5 w-5" />
                  ) : (
                    <Code className="h-5 w-5" />
                  )}
                  <CardTitle className="text-lg">{api.name} API</CardTitle>
                </div>
                <Badge variant="secondary">
                  {api.errorCount} patterns
                </Badge>
              </div>
              <CardDescription>
                Error patterns and solutions for {api.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Categories:</p>
                  <div className="flex flex-wrap gap-1">
                    {api.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Documentation coverage: <span className="font-medium text-foreground">{api.categories.length} categories</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default APIDashboard;

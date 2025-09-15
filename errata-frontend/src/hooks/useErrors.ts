import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import stripeErrors from '../data/stripe-errors.json';

export const useAllErrors = (page: number = 1, api?: string, severity?: string) => {
  return useQuery({
    queryKey: ['allErrors', page, api, severity],
    queryFn: () => {
      // Filter out GitHub errors and get only unique Stripe errors by code
      const stripeOnly = stripeErrors.filter(error => 
        error.code && !error.code.includes('github') && !error.code.includes('_github_')
      );
      
      // Deduplicate by error code to get unique errors only
      const uniqueStripeErrors = stripeOnly.reduce((acc, error) => {
        if (!acc.find(e => e.code === error.code)) {
          acc.push(error);
        }
        return acc;
      }, []);
      
      let filtered = uniqueStripeErrors;
      
      // Apply API filter
      if (api && api !== 'all' && api !== 'Stripe') {
        filtered = [];
      }
      
      // Apply severity filter
      if (severity && severity !== 'all') {
        filtered = filtered.filter(error => {
          const inferredSeverity = inferSeverity(error.code);
          return inferredSeverity === severity;
        });
      }
      
      const start = (page - 1) * 20;
      const end = start + 20;
      const totalPages = Math.ceil(filtered.length / 20);
      
      return Promise.resolve({
        errors: filtered.slice(start, end),
        total: filtered.length, // Should now show ~169 unique Stripe errors
        page,
        pages: totalPages,
        hasMore: end < filtered.length
      });
    },
    staleTime: 60000,
  });
};

export const useSearchErrors = (query: string, page: number = 1, apiFilter?: string) => {
  return useQuery({
    queryKey: ['searchErrors', query, page, apiFilter],
    queryFn: () => {
      // Same cleanup for search
      const stripeOnly = stripeErrors.filter(error => 
        error.code && !error.code.includes('github') && !error.code.includes('_github_')
      );
      
      const uniqueStripeErrors = stripeOnly.reduce((acc, error) => {
        if (!acc.find(e => e.code === error.code)) {
          acc.push(error);
        }
        return acc;
      }, []);
      
      const filtered = uniqueStripeErrors.filter(error => {
        if (!query) return true;
        return error.code?.toLowerCase().includes(query.toLowerCase()) ||
               error.description?.toLowerCase().includes(query.toLowerCase());
      });
      
      const start = (page - 1) * 20;
      const end = start + 20;
      const totalPages = Math.ceil(filtered.length / 20);
      
      return Promise.resolve({
        errors: filtered.slice(start, end),
        total: filtered.length,
        page,
        pages: totalPages,
        hasMore: end < filtered.length
      });
    },
    enabled: query.length > 0,
    staleTime: 30000,
  });
};
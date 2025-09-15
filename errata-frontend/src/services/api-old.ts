import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types matching your current demo data structure
export interface ErrorCode {
  id: string;
  code: string;
  title: string;
  description: string;
  solution: string;
  api: string;
  severity: 'critical' | 'error' | 'warning';
  frequency: string;
  category: string;
  tags: string[];
}

export interface SearchResponse {
  errors: ErrorCode[];
  total: number;
  page: number;
  pages: number;
}

export interface APIStats {
  name: string;
  errorCount: number;
  categories: string[];
}

export const apiService = {
  searchErrors: async (query: string, page: number = 1, limit: number = 20, apiFilter?: string): Promise<SearchResponse> => {
    let allErrors: any[] = [];
    
    // Fetch from specific API or all APIs
    if (apiFilter && apiFilter !== 'all') {
      const response = await apiClient.post('/getAPIErrors', {
        api_name: apiFilter
      });
      allErrors = response.data.errors || [];
    } else {
      // Fetch from all available APIs
      const apis = ['Stripe', 'GitHub'];
      for (const api of apis) {
        try {
          const response = await apiClient.post('/getAPIErrors', {
            api_name: api
          });
          const errors = response.data.errors || [];
          // Tag each error with its API
          errors.forEach((error: any) => error.sourceAPI = api);
          allErrors = allErrors.concat(errors);
        } catch (error) {
          console.warn(`Failed to fetch errors from ${api}:`, error);
        }
      }
    }
    
    // Advanced search filtering
    const filteredErrors = query 
      ? allErrors.filter((error: any) => {
          const searchQuery = query.toLowerCase();
          return error.code.toLowerCase().includes(searchQuery) ||
                 error.message.toLowerCase().includes(searchQuery) ||
                 error.description.toLowerCase().includes(searchQuery) ||
                 (error.resource && error.resource.toLowerCase().includes(searchQuery));
        })
      : allErrors;
    
    // Sort by relevance (exact matches first, then partial matches)
    if (query) {
      filteredErrors.sort((a: any, b: any) => {
        const aCode = a.code.toLowerCase();
        const bCode = b.code.toLowerCase();
        const searchQuery = query.toLowerCase();
        
        // Exact matches first
        if (aCode === searchQuery && bCode !== searchQuery) return -1;
        if (bCode === searchQuery && aCode !== searchQuery) return 1;
        
        // Then code starts with query
        if (aCode.startsWith(searchQuery) && !bCode.startsWith(searchQuery)) return -1;
        if (bCode.startsWith(searchQuery) && !aCode.startsWith(searchQuery)) return 1;
        
        return 0;
      });
    }
    
    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedErrors = filteredErrors.slice(start, end);
    
    // Transform to match our ErrorCode interface
    const errors: ErrorCode[] = paginatedErrors.map((error: any) => ({
      id: error.id,
      code: error.code,
      title: error.code,
      description: error.description,
      solution: error.message,
      api: error.sourceAPI || getAPIFromError(error),
      severity: mapSeverity(error.code),
      frequency: 'common',
      category: getCategory(error.code),
      tags: getTags(error.code)
    }));
    
    return {
      errors,
      total: filteredErrors.length,
      page,
      pages: Math.ceil(filteredErrors.length / limit)
    };
  },

  getAllErrors: async (page: number = 1, limit: number = 20, api?: string, severity?: string): Promise<SearchResponse> => {
    return this.searchErrors('', page, limit, api);
  },

  getErrorById: async (id: string): Promise<ErrorCode> => {
    // Try to find the error in any API
    const apis = ['Stripe', 'GitHub'];
    
    for (const api of apis) {
      try {
        const response = await apiClient.post('/getAPIErrors', {
          api_name: api
        });
        
        const error = response.data.errors?.find((e: any) => e.id === id);
        if (error) {
          // Get solutions for this error
          try {
            const solutionsResponse = await apiClient.post('/findSolutionsByErrorCode', {
              error_code: error.code
            });
            
            const solutions = solutionsResponse.data.solutions || [];
            const solution = solutions.length > 0 ? solutions[0].description : error.message;
            
            return {
              id: error.id,
              code: error.code,
              title: error.code,
              description: error.description,
              solution: solution,
              api: api,
              severity: mapSeverity(error.code),
              frequency: 'common',
              category: getCategory(error.code),
              tags: getTags(error.code)
            };
          } catch (err) {
            // Fallback if solution lookup fails
            return {
              id: error.id,
              code: error.code,
              title: error.code,
              description: error.description,
              solution: error.message,
              api: api,
              severity: mapSeverity(error.code),
              frequency: 'common',
              category: getCategory(error.code),
              tags: getTags(error.code)
            };
          }
        }
      } catch (error) {
        console.warn(`Failed to search in ${api}:`, error);
      }
    }
    
    throw new Error('Error not found');
  },

  getErrorWithSolutions: async (errorCode: string): Promise<{error: ErrorCode, solutions: any[]}> => {
    const response = await apiClient.post('/findSolutionsByErrorCode', {
      error_code: errorCode
    });
    
    const errorData = response.data.errors;
    const solutions = response.data.solutions || [];
    
    if (!errorData) {
      throw new Error('Error not found');
    }
    
    const error: ErrorCode = {
      id: errorData.id,
      code: errorData.code,
      title: errorData.code,
      description: errorData.description,
      solution: solutions.length > 0 ? solutions[0].description : errorData.message,
      api: getAPIFromError(errorData),
      severity: mapSeverity(errorData.code),
      frequency: 'common',
      category: getCategory(errorData.code),
      tags: getTags(errorData.code)
    };
    
    return { error, solutions };
  },

  getAPIStats: async (): Promise<APIStats[]> => {
    const apis = ['Stripe', 'GitHub'];
    const stats: APIStats[] = [];
    
    for (const api of apis) {
      try {
        const response = await apiClient.post('/getAPIErrors', {
          api_name: api
        });
        
        const errors = response.data.errors || [];
        const categories = [...new Set(errors.map((error: any) => getCategory(error.code)))];
        
        stats.push({
          name: api,
          errorCount: errors.length,
          categories: categories
        });
      } catch (error) {
        console.warn(`Failed to get stats for ${api}:`, error);
      }
    }
    
    return stats;
  }
};

// Helper functions
function getAPIFromError(error: any): string {
  // Try to determine API from error patterns
  if (error.code?.includes('stripe') || error.code?.includes('card') || error.code?.includes('payment')) {
    return 'Stripe';
  }
  if (error.code?.includes('github') || error.code?.includes('repository') || error.code?.includes('bad_credentials')) {
    return 'GitHub';
  }
  return 'Unknown';
}

export const apiService = {
  searchErrors: async (query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> => {
    // For now, use getAPIErrors and filter by code if query is provided
    // In future, we could implement semantic search via embeddings
    const response = await apiClient.post('/getAPIErrors', {
      api_name: 'Stripe'
    });
    
    const allErrors = response.data.errors || [];
    
    // Filter by query if provided
    const filteredErrors = query 
      ? allErrors.filter((error: any) => 
          error.code.toLowerCase().includes(query.toLowerCase()) ||
          error.message.toLowerCase().includes(query.toLowerCase()) ||
          error.description.toLowerCase().includes(query.toLowerCase())
        )
      : allErrors;
    
    // Simple pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedErrors = filteredErrors.slice(start, end);
    
    // Transform to match our ErrorCode interface
    const errors: ErrorCode[] = paginatedErrors.map((error: any) => ({
      id: error.id,
      code: error.code,
      title: error.code,
      description: error.description,
      solution: error.message, // Basic fallback
      api: 'Stripe',
      severity: mapSeverity(error.code),
      frequency: 'common',
      category: getCategory(error.code),
      tags: getTags(error.code)
    }));
    
    return {
      errors,
      total: filteredErrors.length,
      page,
      pages: Math.ceil(filteredErrors.length / limit)
    };
  },

  getAllErrors: async (page: number = 1, limit: number = 20, api?: string, severity?: string): Promise<SearchResponse> => {
    const response = await apiClient.post('/getAPIErrors', {
      api_name: 'Stripe'
    });
    
    const allErrors = response.data.errors || [];
    
    // Filter by severity if provided
    const filteredErrors = severity && severity !== 'all'
      ? allErrors.filter((error: any) => mapSeverity(error.code) === severity)
      : allErrors;
    
    // Simple pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedErrors = filteredErrors.slice(start, end);
    
    // Transform to match our ErrorCode interface
    const errors: ErrorCode[] = paginatedErrors.map((error: any) => ({
      id: error.id,
      code: error.code,
      title: error.code,
      description: error.description,
      solution: error.message, // Basic fallback
      api: 'Stripe',
      severity: mapSeverity(error.code),
      frequency: 'common',
      category: getCategory(error.code),
      tags: getTags(error.code)
    }));
    
    return {
      errors,
      total: filteredErrors.length,
      page,
      pages: Math.ceil(filteredErrors.length / limit)
    };
  },

  getErrorById: async (id: string): Promise<ErrorCode> => {
    // First get the error, then get its solutions
    const allErrorsResponse = await apiClient.post('/getAPIErrors', {
      api_name: 'Stripe'
    });
    
    const error = allErrorsResponse.data.errors?.find((e: any) => e.id === id);
    if (!error) {
      throw new Error('Error not found');
    }
    
    // Get solutions for this error
    try {
      const solutionsResponse = await apiClient.post('/findSolutionsByErrorCode', {
        error_code: error.code
      });
      
      const solutions = solutionsResponse.data.solutions || [];
      const solution = solutions.length > 0 ? solutions[0].description : error.message;
      
      return {
        id: error.id,
        code: error.code,
        title: error.code,
        description: error.description,
        solution: solution,
        api: 'Stripe',
        severity: mapSeverity(error.code),
        frequency: 'common',
        category: getCategory(error.code),
        tags: getTags(error.code)
      };
    } catch (err) {
      // Fallback if solution lookup fails
      return {
        id: error.id,
        code: error.code,
        title: error.code,
        description: error.description,
        solution: error.message,
        api: 'Stripe',
        severity: mapSeverity(error.code),
        frequency: 'common',
        category: getCategory(error.code),
        tags: getTags(error.code)
      };
    }
  },

  getErrorWithSolutions: async (errorCode: string): Promise<{error: ErrorCode, solutions: any[]}> => {
    const response = await apiClient.post('/findSolutionsByErrorCode', {
      error_code: errorCode
    });
    
    const errorData = response.data.errors;
    const solutions = response.data.solutions || [];
    
    if (!errorData) {
      throw new Error('Error not found');
    }
    
    const error: ErrorCode = {
      id: errorData.id,
      code: errorData.code,
      title: errorData.code,
      description: errorData.description,
      solution: solutions.length > 0 ? solutions[0].description : errorData.message,
      api: 'Stripe',
      severity: mapSeverity(errorData.code),
      frequency: 'common',
      category: getCategory(errorData.code),
      tags: getTags(errorData.code)
    };
    
    return { error, solutions };
  }
};

// Helper functions
function mapSeverity(code: string): 'critical' | 'error' | 'warning' {
  if (code.includes('authentication') || code.includes('declined') || code.includes('insufficient')) {
    return 'critical';
  }
  if (code.includes('invalid') || code.includes('missing') || code.includes('required')) {
    return 'error';
  }
  return 'warning';
}

function getCategory(code: string): string {
  if (code.includes('authentication') || code.includes('api_key')) return 'Authentication';
  if (code.includes('card') || code.includes('payment')) return 'Payment';
  if (code.includes('parameter') || code.includes('invalid')) return 'Validation';
  if (code.includes('rate_limit')) return 'Rate Limiting';
  if (code.includes('account') || code.includes('balance')) return 'Account';
  return 'General';
}

function getTags(code: string): string[] {
  const tags: string[] = [];
  if (code.includes('authentication')) tags.push('auth');
  if (code.includes('card')) tags.push('card');
  if (code.includes('payment')) tags.push('payment');
  if (code.includes('invalid')) tags.push('validation');
  if (code.includes('rate_limit')) tags.push('rate-limit');
  if (code.includes('account')) tags.push('account');
  return tags;
}
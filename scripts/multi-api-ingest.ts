// @ts-ignore
const fs = require("fs");
// @ts-ignore  
const path = require("path");

// Declare Node.js globals
declare const require: any;
declare const module: any;
declare const __dirname: string;

const HelixDB = require("helix-ts").default || require("helix-ts");

interface ErrorData {
  api: string;
  resource: string;
  method?: string;
  error_type: string;
  error_code?: string;
  http_status?: number;
  decline_code?: string;
  error_message: string;
  solution_title: string;
  solution_description: string;
  reproduce_in_test_mode?: string;
  params_implicated?: string[];
  severity: string;
  source_url: string;
  last_verified: string;
  category: string;
  tags: string[];
}

class MultiAPIIngester {
  private client: any;

  constructor() {
    this.client = new HelixDB("http://localhost:6975");
  }

  async ingestAllAPIs() {
    console.log("🚀 Starting Multi-API HelixDB ingestion...");
    
    // Load comprehensive data
    const allDataPath = path.join(__dirname, "data/all-api-errors.json");
    const allData = JSON.parse(fs.readFileSync(allDataPath, 'utf8'));
    
    console.log(`📊 Found data for ${allData.metadata.apis.length} APIs:`);
    console.log(`- Stripe errors: ${allData.stripe_errors.length}`);
    console.log(`- GitHub errors: ${allData.github_errors.length}`);
    console.log(`- Total patterns: ${allData.metadata.total_patterns}`);

    // Ingest Stripe errors (enhanced dataset)
    await this.ingestStripeErrors(allData.stripe_errors);
    
    // Ingest GitHub errors (new API)
    await this.ingestGitHubErrors(allData.github_errors);
    
    // Test comprehensive hybrid search
    await this.testComprehensiveSearch();
  }

  async ingestStripeErrors(errors: ErrorData[]) {
    console.log("📝 Creating/updating Stripe API node...");
    
    const stripeAPI = await this.client.query("createAPI", {
      name: "Stripe",
      base_url: "https://api.stripe.com",
      version: "2023-10-16", 
      docs_url: "https://docs.stripe.com"
    });
    console.log("✅ Stripe API node ready:", stripeAPI.api?.id || "existing");

    let processed = 0;
    for (const error of errors) {
      try {
        // Create ErrorPattern node with enhanced data
        const errorNode = await this.client.query("createErrorPattern", {
          api_id: stripeAPI.api.id,
          code: error.error_code || error.error_type,
          message: error.error_message,
          description: `${error.error_type}: ${error.error_message}`,
          resource: error.resource,
          method: error.method || "POST",
          http_status: error.http_status || 400,
          severity: error.severity
        });

        // Create Solution node with enhanced details
        const solutionNode = await this.client.query("createSolution", {
          error_id: errorNode.error.id,
          title: error.solution_title,
          description: error.solution_description,
          code_example: this.generateCodeExample(error),
          source_url: error.source_url,
          upvotes: this.calculateUpvotes(error.severity)
        });

        // Create Parameter nodes
        if (error.params_implicated) {
          for (const param of error.params_implicated) {
            await this.client.query("createParameter", {
              error_id: errorNode.error.id,
              name: param,
              param_type: "string",
              required: true,
              description: `Parameter involved in ${error.error_code || error.error_type}`,
              example: `"example_${param}"`
            });
          }
        }

        processed++;
        if (processed % 5 === 0) {
          console.log(`⏳ Processed ${processed}/${errors.length} Stripe errors...`);
        }

      } catch (err) {
        console.error(`❌ Error processing Stripe ${error.error_code}:`, err);
      }
    }

    console.log(`🎉 Successfully ingested ${processed} enhanced Stripe error patterns!`);
  }

  async ingestGitHubErrors(errors: ErrorData[]) {
    console.log("📝 Creating GitHub API node...");
    
    const githubAPI = await this.client.query("createAPI", {
      name: "GitHub",
      base_url: "https://api.github.com",
      version: "2022-11-28",
      docs_url: "https://docs.github.com/en/rest"
    });
    console.log("✅ GitHub API node created:", githubAPI.api?.id);

    let processed = 0;
    for (const error of errors) {
      try {
        // Create ErrorPattern node
        const errorNode = await this.client.query("createErrorPattern", {
          api_id: githubAPI.api.id,
          code: error.error_code || error.error_type,
          message: error.error_message,
          description: `${error.error_type}: ${error.error_message}`,
          resource: error.resource,
          method: "GET",
          http_status: error.http_status || 400,
          severity: error.severity
        });

        // Create Solution node
        const solutionNode = await this.client.query("createSolution", {
          error_id: errorNode.error.id,
          title: error.solution_title,
          description: error.solution_description,
          code_example: this.generateGitHubCodeExample(error),
          source_url: error.source_url,
          upvotes: this.calculateUpvotes(error.severity)
        });

        processed++;

      } catch (err) {
        console.error(`❌ Error processing GitHub ${error.error_code}:`, err);
      }
    }

    console.log(`🎉 Successfully ingested ${processed} GitHub error patterns!`);
  }

  private generateCodeExample(error: ErrorData): string {
    return `// Handle ${error.error_code || error.error_type}
try {
  // Your Stripe API call here
  const result = await stripe.${error.resource}.create({
    // parameters...
  });
} catch (err) {
  if (err.code === '${error.error_code || error.error_type}') {
    // ${error.solution_description}
    console.log('Error:', err.message);
    // Handle specific error case
  }
}`;
  }

  private generateGitHubCodeExample(error: ErrorData): string {
    return `// Handle ${error.error_code || error.error_type}
try {
  const response = await fetch('https://api.github.com/${error.resource}', {
    headers: {
      'Authorization': 'token your_token_here',
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }
  
  const data = await response.json();
} catch (err) {
  if (err.message.includes('${error.http_status}')) {
    // ${error.solution_description}
    console.log('GitHub API Error:', err.message);
  }
}`;
  }

  private calculateUpvotes(severity: string): number {
    switch (severity) {
      case "critical": return 10;
      case "error": return 7;
      case "warning": return 5;
      default: return 3;
    }
  }

  async testComprehensiveSearch() {
    console.log("\n🔍 Testing comprehensive search across multiple APIs...");
    
    try {
      // Test Stripe errors
      console.log("\n--- Stripe API Tests ---");
      const stripeAuth = await this.client.query("findSolutionsByErrorCode", {
        error_code: "authentication_error"
      });
      console.log(`✅ Stripe authentication errors: ${stripeAuth?.solutions?.length || 0} solutions`);

      const stripeCard = await this.client.query("findSolutionsByErrorCode", {
        error_code: "card_declined"
      });
      console.log(`✅ Stripe card declined: ${stripeCard?.solutions?.length || 0} solutions`);

      // Test GitHub errors
      console.log("\n--- GitHub API Tests ---");
      const githubAuth = await this.client.query("findSolutionsByErrorCode", {
        error_code: "bad_credentials"
      });
      console.log(`✅ GitHub bad credentials: ${githubAuth?.solutions?.length || 0} solutions`);

      const githubRate = await this.client.query("findSolutionsByErrorCode", {
        error_code: "rate_limit_exceeded"
      });
      console.log(`✅ GitHub rate limit: ${githubRate?.solutions?.length || 0} solutions`);

      // Get all errors for each API
      console.log("\n--- API Coverage Tests ---");
      const allStripeErrors = await this.client.query("getAPIErrors", {
        api_name: "Stripe"
      });
      console.log(`✅ Total Stripe errors: ${allStripeErrors?.errors?.length || 0}`);

      const allGitHubErrors = await this.client.query("getAPIErrors", {
        api_name: "GitHub"
      });
      console.log(`✅ Total GitHub errors: ${allGitHubErrors?.errors?.length || 0}`);

      // Test cross-API search capabilities
      console.log("\n--- Cross-API Analysis ---");
      const totalAPIs = await this.client.query("testQuery", {});
      console.log(`✅ Total APIs indexed: ${totalAPIs?.apis?.length || 0}`);

    } catch (err) {
      console.log("⚠️ Comprehensive search test failed:", err);
    }
  }
}

// Run the multi-API ingestion
async function main() {
  const ingester = new MultiAPIIngester();
  await ingester.ingestAllAPIs();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MultiAPIIngester;

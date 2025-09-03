// @ts-ignore
const fs = require("fs");
// @ts-ignore  
const path = require("path");

// Declare Node.js globals
declare const require: any;
declare const module: any;
declare const __dirname: string;

const HelixDB = require("helix-ts").default || require("helix-ts");

interface StripeErrorData {
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
}

class APIIngester {
  private client: any; // Change this type to 'any' to avoid type issues

  constructor() {
    // Connect to your local HelixDB instance
    this.client = new HelixDB("http://localhost:6973");
  }

  async ingestStripeErrors() {
    console.log("🚀 Starting HelixDB ingestion...");
    
    // Load your generated error data
    const dataPath = path.join(__dirname, "data/stripe-errors.json");
    const errors: StripeErrorData[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`📊 Found ${errors.length} Stripe error patterns to ingest`);

    // Step 1: Create the main API node (Stripe)
    console.log("📝 Creating API node...");
    const apiResult = await this.client.query("createAPI", {
      name: "Stripe",
      base_url: "https://api.stripe.com",
      version: "2023-10-16", 
      docs_url: "https://docs.stripe.com"
    });
    console.log("✅ API node created:", apiResult);

    // Step 2: Process each error and create nodes/relationships
    let processed = 0;
    for (const error of errors) {
      try {
        // Create ErrorPattern node
        const errorNode = await this.client.query("createErrorPattern", {
          api_id: apiResult.id, // Use the API ID from step 1
          code: error.error_code || error.error_type,
          message: error.error_message,
          description: `${error.error_type}: ${error.error_message}`,
          resource: error.resource,
          method: error.method || "POST",
          http_status: error.http_status || 400,
          severity: error.severity
        });

        // Create Solution node
        const solutionNode = await this.client.query("createSolution", {
          error_id: errorNode.id,
          title: error.solution_title,
          description: error.solution_description,
          code_example: this.generateCodeExample(error),
          source_url: error.source_url,
          upvotes: this.calculateUpvotes(error.severity)
        });

        // Create Parameter nodes (if any)
        if (error.params_implicated) {
        for (const param of error.params_implicated) {
            await this.client.query("createParameter", {
            error_id: errorNode.id,
            name: param,
            param_type: "string", // Changed from "type" to "param_type"
            required: true,
            description: `Parameter involved in ${error.error_code || error.error_type}`,
            example: `"example_${param}"`
            });
          }
        }

        processed++;
        if (processed % 10 === 0) {
          console.log(`⏳ Processed ${processed}/${errors.length} errors...`);
        }

      } catch (err) {
        console.error(`❌ Error processing ${error.error_code}:`, err);
      }
    }

    console.log(`🎉 Successfully ingested ${processed} error patterns into HelixDB!`);
    
    // Test a hybrid query
    await this.testHybridSearch();
  }

  private generateCodeExample(error: StripeErrorData): string {
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

  private calculateUpvotes(severity: string): number {
    // Higher upvotes for more critical errors
    switch (severity) {
      case "blocking": return 10;
      case "transient": return 5;
      case "config": return 7;
      default: return 3;
    }
  }

  private async testHybridSearch() {
    console.log("\n🔍 Testing hybrid search capabilities...");
    
    try {
      // Test search for authentication errors
      const authErrors = await this.client.query("findSolutionsByErrorCode", {
        error_code: "authentication_failed"
      });
      console.log("✅ Authentication errors found:", authErrors?.length || 0);

      // Test search by resource
      const paymentErrors = await this.client.query("getEndpointErrors", {
        api_name: "Stripe",
        endpoint_path: "/v1/payment_intents" 
      });
      console.log("✅ Payment Intent errors found:", paymentErrors?.length || 0);

    } catch (err) {
      console.log("⚠️  Hybrid search test failed (expected if queries not yet defined):", err);
    }
  }
}

// Run the ingestion
async function main() {
  const ingester = new APIIngester();
  await ingester.ingestStripeErrors();
}

// Fix the exports - use CommonJS since you're using require()
module.exports = APIIngester;

// Check if this file is being run directly  
if (require.main === module) {
  main().catch(console.error);
}

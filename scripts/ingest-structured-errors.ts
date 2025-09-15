#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const HELIX_BASE_URL = 'http://localhost:6975';

const ingestStructuredErrors = async () => {
  console.log("🚀 Ingesting structured Stripe errors into HelixDB...");

  let stripeApiId: string;

  try {
    // Try to get existing APIs
    const apisResponse = await axios.post(`${HELIX_BASE_URL}/testQuery`, {});
    const existingApis = apisResponse.data.apis || [];
    
    const stripeApi = existingApis.find((api: any) => api.name === 'Stripe');
    
    if (stripeApi) {
      stripeApiId = stripeApi.id;
      console.log(`✅ Found existing Stripe API with ID: ${stripeApiId}`);
    } else {
      // Create new Stripe API
      const createApiResponse = await axios.post(`${HELIX_BASE_URL}/createAPI`, {
        name: "Stripe",
        base_url: "https://api.stripe.com", 
        version: "2023-10-16",
        docs_url: "https://docs.stripe.com"
      });
      
      stripeApiId = createApiResponse.data.api.id;
      console.log(`✅ Created new Stripe API with ID: ${stripeApiId}`);
    }
  } catch (err) {
    console.error("❌ Failed to get/create Stripe API:", err);
    return;
  }

  const structuredPath = path.join(__dirname, 'data/structured-stripe-errors.json');
  
  if (!fs.existsSync(structuredPath)) {
    console.log("❌ No structured errors found. Run the transformer first!");
    return;
  }
  
  const errors = JSON.parse(fs.readFileSync(structuredPath, 'utf8'));
  console.log(`📊 Found ${errors.length} structured errors to ingest`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const error of errors) {
    try {
      // Create error pattern in HelixDB
      await axios.post(`${HELIX_BASE_URL}/createErrorPattern`, {
        api_id: stripeApiId,
        code: error.code,
        message: error.solution,
        description: error.description,
        resource: "stripe_api",
        method: "POST",
        http_status: 400,
        severity: error.severity,
      });
      
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`   ✅ Ingested ${successCount}/${errors.length} errors...`);
      }
      
    } catch (err: unknown) {
      errorCount++;
      if (errorCount < 5) { // Only show first few errors
        const errorMessage = err && typeof err === 'object' && 'response' in err 
          ? (err as any).response?.data 
          : String(err);
        console.log(`   ❌ Failed to ingest ${error.code}: ${errorMessage}`);
      }
    }
  }
  
  console.log(`\n🎉 Ingestion complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📊 Success rate: ${((successCount / errors.length) * 100).toFixed(1)}%`);
};

if (require.main === module) {
  ingestStructuredErrors();
}
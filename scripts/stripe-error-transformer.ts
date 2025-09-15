#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');

interface ErrorPattern {
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

// Smart categorization based on error code patterns
const categorizeStripeError = (code: string): string => {
  if (code.includes('account') || code.includes('customer') || code.includes('person')) return 'Account Management';
  if (code.includes('card') || code.includes('payment') || code.includes('charge') || code.includes('source')) return 'Payment Processing';
  if (code.includes('auth') || code.includes('key') || code.includes('token') || code.includes('secret')) return 'Authentication';
  if (code.includes('invalid') || code.includes('missing') || code.includes('required')) return 'Validation';
  if (code.includes('rate') || code.includes('limit') || code.includes('quota')) return 'Rate Limiting';
  if (code.includes('webhook') || code.includes('event')) return 'Webhooks';
  if (code.includes('transfer') || code.includes('payout') || code.includes('balance')) return 'Transfers & Payouts';
  if (code.includes('subscription') || code.includes('plan') || code.includes('invoice')) return 'Subscriptions';
  if (code.includes('connect') || code.includes('platform')) return 'Stripe Connect';
  if (code.includes('tax') || code.includes('shipping')) return 'Tax & Shipping';
  return 'General';
};

// Determine severity based on error code patterns
const determineStripeErrorSeverity = (code: string, description: string): 'critical' | 'error' | 'warning' => {
  // Critical errors that completely block functionality
  if (code.includes('auth') || code.includes('key') || code.includes('secret') || 
      code.includes('forbidden') || code.includes('unauthorized') || 
      description.toLowerCase().includes('authentication') ||
      description.toLowerCase().includes('unauthorized')) {
    return 'critical';
  }
  
  // Warnings for less severe issues
  if (code.includes('expired') || code.includes('deprecated') || 
      description.toLowerCase().includes('warning') ||
      description.toLowerCase().includes('recommend')) {
    return 'warning';
  }
  
  // Default to error
  return 'error';
};

// Generate realistic solution based on error pattern
const generateStripeSolution = (code: string, description: string): string => {
  const category = categorizeStripeError(code);
  
  const solutions = {
    'Authentication': 'Verify your Stripe API key is correct and has the necessary permissions.',
    'Payment Processing': 'Verify the payment method details are correct and valid.',
    'Validation': 'Check that all required parameters are included in your request.',
    'Account Management': 'Verify the account or customer ID exists and is accessible.',
    'Rate Limiting': 'Implement exponential backoff in your retry logic.',
    'Webhooks': 'Verify your webhook endpoint is accessible and returns a 2xx status.',
    'General': 'Review the Stripe API documentation for this specific error.'
  };
  
  return solutions[category as keyof typeof solutions] || solutions['General'];
};

// Generate frequency estimate based on error pattern
const estimateFrequency = (code: string): string => {
  if (code.includes('invalid') || code.includes('missing') || code.includes('required')) return 'Very Common';
  if (code.includes('card') || code.includes('payment') || code.includes('charge')) return 'Common';
  if (code.includes('auth') || code.includes('key')) return 'Common';
  if (code.includes('rate') || code.includes('limit')) return 'Uncommon';
  if (code.includes('webhook') || code.includes('connect')) return 'Rare';
  return 'Moderate';
};

// Generate relevant tags
const generateTags = (code: string, category: string): string[] => {
  const tags = ['stripe', 'api'];
  
  if (code.includes('card')) tags.push('card', 'payment');
  if (code.includes('customer')) tags.push('customer', 'account');
  if (code.includes('auth')) tags.push('authentication', 'security');
  if (code.includes('webhook')) tags.push('webhook', 'events');
  if (code.includes('connect')) tags.push('connect', 'platform');
  if (code.includes('subscription')) tags.push('subscription', 'recurring');
  if (code.includes('transfer')) tags.push('transfer', 'payout');
  
  // Add category as tag
  tags.push(category.toLowerCase().replace(/ /g, '_'));
  
  return [...new Set(tags)]; // Remove duplicates
};

const transformStripeError = (errorData: any): ErrorPattern => {
  // Fix the return type to match the union type
  const getSeverity = (code: string, description: string): 'critical' | 'error' | 'warning' => {
    if (code.includes('authentication') || code.includes('unauthorized') || code.includes('forbidden')) {
      return 'critical';
    }
    if (code.includes('rate_limit') || code.includes('quota') || code.includes('limit_exceeded')) {
      return 'warning'; 
    }
    if (description.toLowerCase().includes('invalid') || description.toLowerCase().includes('missing')) {
      return 'error';
    }
    return 'error'; // default
  };

  const category = categorizeStripeError(errorData.code);

  return {
    id: `stripe_${errorData.code}_${Date.now()}_${Math.random()}`,
    code: errorData.code,
    title: `Stripe ${errorData.code} Error`,
    description: errorData.description || "No description provided.",
    solution: errorData.message || "Review the Stripe API documentation for this specific error.",
    api: 'stripe',
    severity: getSeverity(errorData.code, errorData.description),
    frequency: estimateFrequency(errorData.code),
    category: category,
    tags: generateTags(errorData.code, category)
  };
};

// Main transformation function
const transformRawStripeErrors = (rawContent: string): ErrorPattern[] => {
  console.log("🔄 Transforming raw Stripe errors...");
  
  const errors: ErrorPattern[] = [];
  
  // Split content by lines and process
  const lines = rawContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentCode = '';
  let currentDescription = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    
    // Check if this looks like an error code (usually snake_case or all lowercase)
    const isErrorCode = /^[a-z][a-z0-9_]*[a-z0-9]$/.test(line) && !line.includes(' ');
    
    if (isErrorCode) {
      // Process previous error if we have one
      if (currentCode && currentDescription) {
        const category = categorizeStripeError(currentCode);
        const severity = determineStripeErrorSeverity(currentCode, currentDescription);
        
        errors.push({
          id: `stripe_${currentCode}_${Date.now()}_${errors.length}`,
          code: currentCode,
          title: `Stripe ${currentCode} Error`,
          description: currentDescription,
          solution: generateStripeSolution(currentCode, currentDescription),
          api: 'stripe',
          severity,
          frequency: estimateFrequency(currentCode),
          category,
          tags: generateTags(currentCode, category)
        });
      }
      
      // Start new error
      currentCode = line;
      currentDescription = '';
    } else {
      // This is likely a description
      if (currentCode) {
        currentDescription += (currentDescription ? ' ' : '') + line;
      }
    }
  }
  
  // Process the last error
  if (currentCode && currentDescription) {
    const category = categorizeStripeError(currentCode);
    const severity = determineStripeErrorSeverity(currentCode, currentDescription);
    
    errors.push({
      id: `stripe_${currentCode}_${Date.now()}_${errors.length}`,
      code: currentCode,
      title: `Stripe ${currentCode} Error`,
      description: currentDescription,
      solution: generateStripeSolution(currentCode, currentDescription),
      api: 'stripe',
      severity,
      frequency: estimateFrequency(currentCode),
      category,
      tags: generateTags(currentCode, category)
    });
  }
  
  console.log(`✅ Transformed ${errors.length} Stripe errors`);
  return errors;
};

// Main execution
const main = async () => {
  const rawFilePath = path.join(__dirname, 'data/raw-stripe-errors.txt');
  
  if (!fs.existsSync(rawFilePath)) {
    console.log("❌ File not found:", rawFilePath);
    console.log("📋 Please make sure you have raw-stripe-errors.txt in the data folder");
    return;
  }
  
  const rawContent = fs.readFileSync(rawFilePath, 'utf8');
  const transformedErrors = transformRawStripeErrors(rawContent);
  
  if (transformedErrors.length === 0) {
    console.log("❌ Could not parse any errors. Please check the format.");
    return;
  }
  
  // Save structured errors
  const outputPath = path.join(__dirname, 'data/structured-stripe-errors.json');
  fs.writeFileSync(outputPath, JSON.stringify(transformedErrors, null, 2));
  
  console.log(`\n🎉 Success! Processed ${transformedErrors.length} Stripe errors`);
  console.log(`💾 Saved to: ${outputPath}`);
  
  // Show statistics
  const categories = [...new Set(transformedErrors.map(e => e.category))];
  const severities = [...new Set(transformedErrors.map(e => e.severity))];
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Categories: ${categories.length} (${categories.join(', ')})`);
  console.log(`   Severities: ${severities.join(', ')}`);
  console.log(`   Critical: ${transformedErrors.filter(e => e.severity === 'critical').length}`);
  console.log(`   Errors: ${transformedErrors.filter(e => e.severity === 'error').length}`);
  console.log(`   Warnings: ${transformedErrors.filter(e => e.severity === 'warning').length}`);
  
  console.log(`\n🚀 Ready to ingest into HelixDB!`);
};

if (require.main === module) {
  main();
}

module.exports = { transformRawStripeErrors };
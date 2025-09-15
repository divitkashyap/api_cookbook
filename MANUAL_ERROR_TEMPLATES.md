# 📋 Quick Error Pattern Templates

## For easy copy-paste when manually adding error patterns:

### Stripe Error Template
```json
{
  "api": "Stripe",
  "resource": "charges",
  "method": "POST", 
  "error_type": "card_error",
  "error_code": "card_declined",
  "http_status": 402,
  "error_message": "Your card was declined",
  "solution_title": "Handle card decline gracefully",
  "solution_description": "Inform user and suggest alternative payment method",
  "reproduce_in_test_mode": "Use test card 4000000000000002",
  "params_implicated": ["card", "amount"],
  "severity": "critical",
  "source_url": "https://docs.stripe.com/declines",
  "last_verified": "2025-09-12T06:00:00.000Z",
  "category": "Payment",
  "tags": ["card", "decline", "payment"]
}
```

### GitHub Error Template
```json
{
  "api": "GitHub",
  "resource": "repos",
  "error_type": "not_found",
  "error_code": "not_found",
  "http_status": 404,
  "error_message": "Not Found",
  "solution_title": "Verify repository exists",
  "solution_description": "Check repo name, permissions, and access rights",
  "source_url": "https://docs.github.com/en/rest",
  "last_verified": "2025-09-12T06:00:00.000Z",
  "severity": "error",
  "category": "Resources",
  "tags": ["repository", "access", "permissions"]
}
```

### Generic API Error Template  
```json
{
  "api": "API_NAME",
  "resource": "resource_name",
  "method": "GET|POST|PUT|DELETE",
  "error_type": "error_category",
  "error_code": "specific_error_code",
  "http_status": 400,
  "error_message": "Human readable error message",
  "solution_title": "Brief solution title",
  "solution_description": "Detailed solution explanation", 
  "source_url": "https://docs.api.com/errors",
  "last_verified": "2025-09-12T06:00:00.000Z",
  "severity": "critical|error|warning",
  "category": "Authentication|Payment|Validation|Rate Limiting|Resources|Security",
  "tags": ["tag1", "tag2", "tag3"]
}
```

## Common Error Categories:
- **Authentication**: API keys, tokens, credentials
- **Payment**: Card declines, insufficient funds, payment processing
- **Validation**: Missing parameters, invalid data, format errors
- **Rate Limiting**: Too many requests, quota exceeded
- **Resources**: Not found, access denied, permissions
- **Security**: Webhook signatures, SSL/TLS issues
- **General**: Catch-all for other errors

## Common Severity Levels:
- **critical**: Blocks core functionality (auth failures, payment issues)
- **error**: Prevents feature from working (validation, missing data)
- **warning**: Degrades experience but not blocking (rate limits)

## Quick Commands:
```bash
# Add new error patterns to existing data
cd scripts
npx ts-node enhanced-stripe-scraper.ts

# Ingest new patterns into HelixDB
npx ts-node multi-api-ingest.ts

# Test the new patterns
curl -X POST "http://localhost:6975/getAPIErrors" -H "Content-Type: application/json" -d '{"api_name": "YourAPI"}'
```

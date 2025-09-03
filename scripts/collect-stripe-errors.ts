// collect-stripe-errors.ts
// Build a license-clean, Helix-ready Stripe error dataset.
// Writes: data/stripe-errors.json

// @ts-ignore - CJS require under verbatimModuleSyntax true
const fs = require("fs");
// @ts-ignore
const path = require("path");
// ----------------------------- Types -----------------------------
type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
type Severity = "blocking" | "transient" | "config";

type StripeErrorRow = {
  api: "Stripe";
  resource: string;                    // e.g., "payment_intent", "invoice", "customer"
  applies_to?: string[];               // optional endpoint list: ["/v1/payment_intents"]
  method?: HttpMethod;
  error_type: "invalid_request_error" | "card_error" | "api_error" | "authentication_error" | "rate_limit_error";
  error_code?: string;                 // e.g., "authentication_required" (omit when none)
  http_status?: number;                // e.g., 400/401/402/429
  decline_code?: string;               // for card declines e.g., "insufficient_funds"
  error_message: string;               // concise, human-readable
  solution_title: string;              // short imperative
  solution_description: string;        // one-liner, doc-aligned, paraphrased
  reproduce_in_test_mode?: string;     // brief repro (test card / flow / omitted param)
  params_implicated?: string[];        // e.g., ["payment_method","amount"]
  severity: Severity;
  source_url: string;                  // deep link to Stripe docs/anchor when possible
  last_verified: string;               // ISO date
};

// ----------------------------- Config -----------------------------
const OUT_DIR = "data";
const OUT_FILE = path.join(OUT_DIR, "stripe-errors.json");
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const DOCS = {
  ERROR_CODES: "https://docs.stripe.com/error-codes",
  DECLINE_CODES: "https://docs.stripe.com/declines/codes",
  TESTING: "https://docs.stripe.com/testing",
  API_ERRORS: "https://docs.stripe.com/api/errors",
  KEYS: "https://docs.stripe.com/keys",
};

const COMMON_STATUS: Record<string, number> = {
  invalid_request_error: 400,
  authentication_error: 401,
  card_error: 402,
  rate_limit_error: 429,
};

// If an error_code is present, we deep link to anchor #code.
// For decline_code, we deep link to /declines/codes#decline_code.
const linkFor = (row: StripeErrorRow): string => {
  if (row.decline_code) return `${DOCS.DECLINE_CODES}#${row.decline_code}`;
  if (row.error_code) return `${DOCS.ERROR_CODES}#${row.error_code}`;
  // For type-only cases (e.g., invalid API key → authentication_error without a specific code)
  if (row.error_type === "authentication_error") return DOCS.API_ERRORS;
  return DOCS.ERROR_CODES;
};

// ----------------------------- Seed (curated exemplars) -----------------------------
// Add more rows as you grow the set. Keep solutions paraphrased from Stripe docs.
const SEED: Omit<StripeErrorRow, "source_url" | "last_verified" | "http_status">[] = [
  // 401, invalid API key → type-only (no canonical code on public list)
  {
    api: "Stripe",
    resource: "any",
    method: "POST",
    error_type: "authentication_error",
    error_message: "Invalid API key provided",
    solution_title: "Verify API key configuration",
    solution_description: "Use the correct key (test vs live), ensure it’s active, and not mixed across environments.",
    reproduce_in_test_mode: "Set an invalid secret key (e.g., 'sk_test_invalid')",
    params_implicated: ["Authorization"],
    severity: "blocking",
  },
  // Parameter omissions/shape errors
  {
    api: "Stripe",
    resource: "payment_intent",
    method: "POST",
    error_type: "invalid_request_error",
    error_code: "parameter_missing", // anchor exists; generic missing parameter case
    error_message: "Missing required parameter",
    solution_title: "Add required parameters",
    solution_description: "Include all required fields for the endpoint, matching types and constraints.",
    reproduce_in_test_mode: "Create PaymentIntent without 'amount'",
    params_implicated: ["amount", "currency"],
    severity: "blocking",
  },
  // 3DS / SCA
  {
    api: "Stripe",
    resource: "payment_intent",
    method: "POST",
    error_type: "card_error",
    error_code: "authentication_required",
    error_message: "The payment requires authentication to proceed",
    solution_title: "Prompt 3D Secure",
    solution_description: "Handle SCA: redirect/handle next_action for 3DS, or collect a new payment method.",
    reproduce_in_test_mode: "Use 3DS test card 4000002500003155 and confirm off_session to trigger authentication.",
    params_implicated: ["payment_method", "confirmation_method"],
    severity: "blocking",
  },
  // Generic decline
  {
    api: "Stripe",
    resource: "payment_intent",
    method: "POST",
    error_type: "card_error",
    error_code: "card_declined",
    decline_code: "generic_decline",
    error_message: "The card was declined",
    solution_title: "Ask for a different card",
    solution_description: "Prompt the customer to try another card or contact their bank.",
    reproduce_in_test_mode: "Use test card 4000000000000002",
    params_implicated: ["payment_method"],
    severity: "blocking",
  },
  // Insufficient funds
  {
    api: "Stripe",
    resource: "payment_intent",
    method: "POST",
    error_type: "card_error",
    error_code: "card_declined",
    decline_code: "insufficient_funds",
    error_message: "The customer's account has insufficient funds",
    solution_title: "Try a different payment method",
    solution_description: "Ask the customer to add funds or use another card/payment method.",
    reproduce_in_test_mode: "Use test card 4000000000009995",
    params_implicated: ["amount", "payment_method"],
    severity: "blocking",
  },
  // Expired card
  {
    api: "Stripe",
    resource: "payment_method",
    method: "POST",
    error_type: "card_error",
    error_code: "card_declined",
    decline_code: "expired_card",
    error_message: "The card has expired",
    solution_title: "Collect an updated card",
    solution_description: "Ask the customer for a card with a valid expiry date.",
    reproduce_in_test_mode: "Use test card 4000000000000069",
    params_implicated: ["exp_month", "exp_year"],
    severity: "blocking",
  },
  // Amount too small
  {
    api: "Stripe",
    resource: "payment_intent",
    method: "POST",
    error_type: "invalid_request_error",
    error_code: "amount_too_small",
    error_message: "The specified amount is less than the minimum allowed",
    solution_title: "Use minimum amount",
    solution_description: "Increase the amount to meet the minimum (varies by currency/payment method).",
    reproduce_in_test_mode: "Create PaymentIntent with amount below the minimum (e.g., 10 cents USD).",
    params_implicated: ["amount"],
    severity: "blocking",
  },
  // Amount too large
  {
    api: "Stripe",
    resource: "payment_intent",
    method: "POST",
    error_type: "invalid_request_error",
    error_code: "amount_too_large",
    error_message: "The specified amount exceeds the maximum allowed",
    solution_title: "Use smaller amount",
    solution_description: "Reduce the amount within allowed limits (varies by payment method).",
    reproduce_in_test_mode: "Create PaymentIntent with an extremely large amount.",
    params_implicated: ["amount"],
    severity: "blocking",
  },
  // Rate limit
  {
    api: "Stripe",
    resource: "any",
    method: "POST",
    error_type: "rate_limit_error",
    error_message: "Too many requests hit the API",
    solution_title: "Backoff and retry",
    solution_description: "Throttle requests and implement exponential backoff with jitter.",
    reproduce_in_test_mode: "Send a burst of rapid requests to the same endpoint.",
    severity: "transient",
  },
  // Email invalid
  {
    api: "Stripe",
    resource: "customer",
    method: "POST",
    error_type: "invalid_request_error",
    error_code: "email_invalid",
    error_message: "The email address is invalid",
    solution_title: "Validate email",
    solution_description: "Ensure the email is properly formatted and allowed.",
    reproduce_in_test_mode: "Create Customer with email 'invalid-email'",
    params_implicated: ["email"],
    severity: "blocking",
  },
  // Invoice: no customer line items
  {
    api: "Stripe",
    resource: "invoice",
    method: "POST",
    error_type: "invalid_request_error",
    error_code: "invoice_no_customer_line_items",
    error_message: "No pending invoice items for that customer",
    solution_title: "Create invoice items",
    solution_description: "Add pending invoice items or ensure the right customer is selected.",
    reproduce_in_test_mode: "Attempt to create/finalize invoice without any line items.",
    params_implicated: ["customer", "line_items"],
    severity: "blocking",
  },
  // Balance insufficient (transfers/payouts)
  {
    api: "Stripe",
    resource: "transfer",
    method: "POST",
    error_type: "invalid_request_error",
    error_code: "balance_insufficient",
    error_message: "Insufficient available balance",
    solution_title: "Adjust transfer amount",
    solution_description: "Use an amount ≤ available balance, or wait for funds to settle.",
    reproduce_in_test_mode: "Create a transfer over available balance to a connected account.",
    params_implicated: ["amount", "destination"],
    severity: "blocking",
  },
  // Add/replace these inside the SEED array in collect-stripe-errors.ts
// Shape: Omit<StripeErrorRow, "source_url" | "last_verified" | "http_status">

{
  api: "Stripe",
  resource: "any",
  method: "POST",
  error_type: "authentication_error",
  // no error_code here; "authentication_failed" isn't a canonical public code for invalid API key
  error_message: "Invalid API key provided",
  solution_title: "Verify API key configuration",
  solution_description: "Use the correct key (test vs live), ensure it’s active, and not mixed across environments.",
  reproduce_in_test_mode: "Set an invalid secret key (e.g., 'sk_test_invalid')",
  params_implicated: ["Authorization"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "payment_intent",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invalid_request_error",
  error_message: "Missing required parameter",
  solution_title: "Add required parameters",
  solution_description: "Include all required fields for the endpoint, matching types and constraints.",
  reproduce_in_test_mode: "Create PaymentIntent without 'amount'",
  params_implicated: ["amount","currency"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "any",
  method: "POST",
  error_type: "rate_limit_error",
  error_code: "rate_limit_error",
  error_message: "Too many requests hit the API",
  solution_title: "Backoff and retry",
  solution_description: "Throttle requests and implement exponential backoff with jitter.",
  reproduce_in_test_mode: "Send a burst of rapid requests to the same endpoint.",
  severity: "transient"
},
{
  api: "Stripe",
  resource: "payment_method",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "postal_code_invalid",
  error_message: "The postal code provided was incorrect.",
  solution_title: "Validate postal code",
  solution_description: "Ensure the postal/ZIP code matches the card’s billing address format.",
  params_implicated: ["billing_details[address][postal_code]"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "tax",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "stripe_tax_inactive",
  error_message: "Stripe Tax hasn't been activated on your account.",
  solution_title: "Activate Stripe Tax",
  solution_description: "Enable Stripe Tax in Dashboard settings before creating tax calculations.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "card_error",
  error_code: "account_closed",
  error_message: "The customer's bank account has been closed.",
  solution_title: "Collect different bank account",
  solution_description: "Ask the customer to provide a different, active bank account.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "account_country_invalid_address",
  error_message: "Business address country doesn't match the account country.",
  solution_title: "Fix address country",
  solution_description: "Update the business address to match the account country.",
  params_implicated: ["business_profile[address][country]"],
  severity: "config"
},
{
  api: "Stripe",
  resource: "account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "account_invalid",
  error_message: "Invalid account ID provided in Stripe-Account header.",
  solution_title: "Verify account ID",
  solution_description: "Use a valid connected account ID when using the Stripe-Account header.",
  params_implicated: ["Stripe-Account"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "account_error_country_change_requires_additional_steps",
  error_message: "Changing account country requires additional steps.",
  solution_title: "Contact Stripe support",
  solution_description: "Coordinate country change with Stripe as Connect platforms need extra steps.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "account_number_invalid",
  error_message: "Bank account number is invalid.",
  solution_title: "Validate account number",
  solution_description: "Confirm format and digits per country requirements.",
  params_implicated: ["account_number","country","currency"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "payment_intent",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "amount_too_large",
  error_message: "The amount exceeds the maximum allowed.",
  solution_title: "Reduce amount",
  solution_description: "Lower the amount within method and currency limits.",
  params_implicated: ["amount"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "payment_intent",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "amount_too_small",
  error_message: "The amount is below the minimum allowed.",
  solution_title: "Increase amount",
  solution_description: "Increase to at least the minimum allowed for the currency/method.",
  params_implicated: ["amount"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "any",
  method: "POST",
  error_type: "authentication_error",
  error_code: "api_key_expired",
  error_message: "The API key provided has expired.",
  solution_title: "Rotate API keys",
  solution_description: "Generate a new key in Dashboard and update your environment.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "payment_intent",
  method: "POST",
  error_type: "card_error",
  error_code: "authentication_required",
  error_message: "The payment requires authentication to proceed.",
  solution_title: "Prompt 3D Secure",
  solution_description: "Handle SCA by prompting 3DS or collect a different payment method.",
  reproduce_in_test_mode: "Use 3DS test card 4000002500003155 and confirm off_session.",
  params_implicated: ["payment_method","confirmation_method"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "transfer",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "balance_insufficient",
  error_message: "Insufficient available balance for transfer/payout.",
  solution_title: "Lower transfer amount",
  solution_description: "Use an amount ≤ available balance or wait for funds to settle.",
  params_implicated: ["amount","destination"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "balance",
  method: "GET",
  error_type: "invalid_request_error",
  error_code: "balance_invalid_parameter",
  error_message: "Invalid parameter in balance method.",
  solution_title: "Fix parameter",
  solution_description: "Use correct parameters for the balance API.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "bank_account_bad_routing_numbers",
  error_message: "Bank account doesn’t support the currency.",
  solution_title: "Use supported currency/account",
  solution_description: "Provide a bank account that supports the intended currency.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "bank_account_declined",
  error_message: "Bank account can’t be used to charge (unverified/unsupported).",
  solution_title: "Verify or change bank account",
  solution_description: "Complete microdeposit verification or use a supported account.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "bank_account_exists",
  error_message: "Bank account already exists on the Customer.",
  solution_title: "Reuse or select correct customer",
  solution_description: "Use the existing bank account or correct the customer reference.",
  params_implicated: ["customer","external_account"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "bank_account_verification_failed",
  error_message: "Bank account verification failed via microdeposits.",
  solution_title: "Retry with correct amounts",
  solution_description: "Ensure microdeposit amounts match and avoid too many failed attempts.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "bank_account_unusable",
  error_message: "The bank account provided can't be used.",
  solution_title: "Collect a different bank account",
  solution_description: "Provide another valid bank account.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "bank_account_unverified",
  error_message: "Attempting to share an unverified bank account with a connected account.",
  solution_title: "Verify account first",
  solution_description: "Complete bank account verification before sharing.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "charge",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "capture_charge_authorization_expired",
  error_message: "Authorization expired; charge can’t be captured.",
  solution_title: "Create a new payment",
  solution_description: "Re-create the payment since the authorization window has passed.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "charge",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "capture_unauthorized_payment",
  error_message: "Charge hasn’t been authorized for capture.",
  solution_title: "Authorize first",
  solution_description: "Ensure the charge/payment was authorized before capture.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "payment_intent",
  method: "POST",
  error_type: "card_error",
  error_code: "card_decline_rate_limit_exceeded",
  error_message: "This card was declined too many times recently.",
  solution_title: "Wait or use different card",
  solution_description: "Retry later (e.g., 24h) or ask customer to contact their bank/use another card.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "charge",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "charge_already_captured",
  error_message: "Charge has already been captured.",
  solution_title: "Use uncaptured charge",
  solution_description: "Only capture charges that are in an uncaptured state.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "charge",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "charge_already_refunded",
  error_message: "Charge has already been refunded.",
  solution_title: "Don’t refund again",
  solution_description: "Use a different charge ID or avoid double refund.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "charge",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "charge_disputed",
  error_message: "Charge was charged back.",
  solution_title: "Handle the dispute",
  solution_description: "Submit evidence via the Disputes process instead of refunding.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "charge",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "charge_exceeds_source_limit",
  error_message: "Charge exceeds rolling-window processing limit for this source type.",
  solution_title: "Retry later or raise limits",
  solution_description: "Try again later or request higher processing limits from Stripe.",
  severity: "transient"
},
{
  api: "Stripe",
  resource: "charge",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "charge_exceeds_transaction_limit",
  error_message: "Charge would exceed the processing limit for this payment type.",
  solution_title: "Contact Stripe to increase limits",
  solution_description: "Request higher processing limits if needed.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "charge",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "charge_invalid_parameter",
  error_message: "Provided parameters aren’t allowed for Charge.",
  solution_title: "Fix charge params",
  solution_description: "Use only allowed fields per the Charge API.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "country_unsupported",
  error_message: "Attempted to create a custom account in an unsupported country.",
  solution_title: "Restrict signup by country",
  solution_description: "Allow only supported countries for Connect custom accounts.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "country_code_invalid",
  error_message: "Invalid country code provided.",
  solution_title: "Use valid ISO country",
  solution_description: "Provide a valid two-letter ISO country code.",
  params_implicated: ["country"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "coupon",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "coupon_expired",
  error_message: "The coupon has expired.",
  solution_title: "Use valid coupon",
  solution_description: "Create a new coupon or use an existing valid coupon.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "subscription",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "customer_max_subscriptions",
  error_message: "The maximum number of subscriptions for a customer has been reached.",
  solution_title: "Review subscription policy",
  solution_description: "Reduce active subscriptions or contact Stripe support.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "customer",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "customer_max_payment_methods",
  error_message: "The maximum number of PaymentMethods for this Customer has been reached.",
  solution_title: "Detach some payment methods",
  solution_description: "Detach unused PaymentMethods or use a different customer.",
  params_implicated: ["payment_method","customer"],
  severity: "config"
},
{
  api: "Stripe",
  resource: "customer",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "customer_tax_location_invalid",
  error_message: "Customer address missing or invalid for tax.",
  solution_title: "Provide tax-valid address",
  solution_description: "At minimum, set country (ISO) and postal_code; include state/province where required.",
  params_implicated: ["address[country]","address[postal_code]"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "shipping",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "shipping_address_invalid",
  error_message: "Shipping address can’t be used to determine tax rates.",
  solution_title: "Fix shipping address",
  solution_description: "Verify postal/ZIP, state/region/province fields.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "billing",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "billing_invalid_mandate",
  error_message: "Attempted payment without an active mandate.",
  solution_title: "Create/confirm mandate first",
  solution_description: "Confirm PaymentMethod on-session with PaymentIntent/SetupIntent to create mandate.",
  params_implicated: ["payment_method","setup_future_usage"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "customer",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "email_invalid",
  error_message: "The email address is invalid.",
  solution_title: "Validate email format",
  solution_description: "Ensure the email is properly formatted and allowed.",
  params_implicated: ["email"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "idempotency",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "idempotency_key_in_use",
  error_message: "Idempotency key is currently being used in another request.",
  solution_title: "Avoid concurrent duplicates",
  solution_description: "Don’t send concurrent requests with the same idempotency key; wait or use a new key.",
  severity: "transient"
},
{
  api: "Stripe",
  resource: "financial_connections",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "financial_connections_account_inactive",
  error_message: "Data can't be refreshed on inactive Financial Connections accounts.",
  solution_title: "Re-activate account",
  solution_description: "Ensure the Financial Connections account is active before refreshing data.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "financial_connections",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "financial_connections_no_successful_transaction_refresh",
  error_message: "No successful transaction refresh yet for this account.",
  solution_title: "Complete a transaction refresh",
  solution_description: "Perform at least one successful transaction refresh before fetching data.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "payout",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "instant_payouts_unsupported",
  error_message: "Instant Payouts are not available for this request.",
  solution_title: "Check Instant Payouts eligibility",
  solution_description: "Review requirements and supported configurations; enable if eligible.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "payout",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "instant_payouts_limit_exceeded",
  error_message: "Daily processing limits for Instant Payouts reached.",
  solution_title: "Try later or request increase",
  solution_description: "Wait until the next day or contact Stripe to raise limits.",
  severity: "transient"
},
{
  api: "Stripe",
  resource: "payout",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "instant_payouts_config_disabled",
  error_message: "Connected account isn’t eligible for Instant Payouts.",
  solution_title: "Enable eligibility",
  solution_description: "Ask the platform to enable Instant Payouts for this account if possible.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "payout",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "payouts_limit_exceeded",
  error_message: "Daily processing limits reached for this payout type.",
  solution_title: "Retry later or request increase",
  solution_description: "Wait until the next day or contact Stripe to increase limits.",
  severity: "transient"
},
{
  api: "Stripe",
  resource: "payment_intent",
  method: "POST",
  error_type: "card_error",
  error_code: "card_declined",
  decline_code: "insufficient_funds",
  error_message: "The customer's account has insufficient funds to cover this payment.",
  solution_title: "Try a different payment method",
  solution_description: "Ask the customer to add funds or use another card/payment method.",
  reproduce_in_test_mode: "Use test card 4000000000009995",
  params_implicated: ["amount","payment_method"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "any",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invalid_characters",
  error_message: "Field contains unsupported characters.",
  solution_title: "Remove unsupported characters",
  solution_description: "Provide only allowed characters per field requirements.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "external_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invalid_card_type",
  error_message: "The card as an external account isn't supported for payouts.",
  solution_title: "Provide non-prepaid debit",
  solution_description: "Attach a supported debit card for payouts instead.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "invoice",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invoice_no_customer_line_items",
  error_message: "No pending invoice items for the customer.",
  solution_title: "Create invoice items",
  solution_description: "Add pending invoice items or ensure the right customer is selected.",
  params_implicated: ["customer","line_items"],
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "invoice",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invoice_on_behalf_of_not_editable",
  error_message: "on_behalf_of can't be updated after invoice number is assigned.",
  solution_title: "Set on_behalf_of earlier",
  solution_description: "Update on_behalf_of before the invoice number is assigned.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "invoice",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invoice_no_payment_method_types",
  error_message: "No payment method types available to process the invoice.",
  solution_title: "Enable payment methods",
  solution_description: "Activate or configure payment method types in the template/Dashboard.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "invoice",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invoice_no_subscription_line_items",
  error_message: "No pending subscription invoice items.",
  solution_title: "Add subscription items",
  solution_description: "Ensure the subscription has billable items or create pending items.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "invoice",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invoice_not_editable",
  error_message: "Invoice can no longer be edited.",
  solution_title: "Add items to next invoice",
  solution_description: "Create additional invoice items for the next invoice.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "invoice",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "invoice_payment_intent_requires_action",
  error_message: "Payment requires additional user action.",
  solution_title: "Complete via PaymentIntent",
  solution_description: "Prompt the customer to complete the PaymentIntent’s next_action (e.g., 3DS).",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "invoice",
  method: "GET",
  error_type: "invalid_request_error",
  error_code: "invoice_upcoming_none",
  error_message: "No upcoming invoice to preview.",
  solution_title: "Ensure billable items",
  solution_description: "Only customers with active subscriptions or pending items have previewable invoices.",
  severity: "config"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "no_account",
  error_message: "The bank account couldn't be located.",
  solution_title: "Verify bank details",
  solution_description: "Confirm routing and account numbers and that the account exists.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "debit_not_authorized",
  error_message: "Customer reported the debit as unauthorized.",
  solution_title: "Resolve authorization",
  solution_description: "Work with the customer to authorize the debit or use a different payment method.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "bank_account",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "bank_account_restricted",
  error_message: "Customer’s account can't be used with this payment method.",
  solution_title: "Try a different method",
  solution_description: "Ask customer to contact their bank or use another method.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "orders",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "out_of_inventory",
  error_message: "One or more line items are out of stock.",
  solution_title: "Update inventory",
  solution_description: "Adjust orderable quantity or remove out-of-stock items.",
  severity: "blocking"
},
{
  api: "Stripe",
  resource: "any",
  method: "POST",
  error_type: "invalid_request_error",
  error_code: "parameter_invalid_empty",
  error_message: "One or more required values weren't provided.",
  solution_title: "Provide required values",
  solution_description: "Include all required parameters for the API call.",
  severity: "blocking"
}

];
// ----------------------------- Merge: load legacy JSOn & normalise -----------------------------

// ----------------------------- Normalization & Build -----------------------------
// Replace the normalize function with this fixed version:

function normalize(row: Omit<StripeErrorRow, "source_url" | "last_verified" | "http_status">): StripeErrorRow {
  // Clone and set required fields first
  const r: StripeErrorRow = {
    ...row,
    source_url: "", // fill below
    last_verified: TODAY,
    // Don't set http_status to undefined initially
  };

  // Default HTTP status by type if not provided
  const defaultStatus = COMMON_STATUS[r.error_type];
  if (defaultStatus !== undefined) {
    r.http_status = defaultStatus;
  }

  // Rate limit: should typically be 429
  if (r.error_type === "rate_limit_error") {
    r.http_status = 429;
  }

  // Prefer PaymentIntents in modern flows (only heuristic for "any")
  if (r.resource === "any") r.resource = "payment_intent";

  // Compute source_url
  r.source_url = linkFor(r);

  // Minimal field hygiene
  if (r.error_type === "authentication_error" && r.error_code) {
    // public list usually doesn't have a granular code for invalid key → drop it
    delete r.error_code;
    r.source_url = linkFor(r);
  }

  return r;
}

function build(): StripeErrorRow[] {
  return SEED.map(normalize);
}

// ----------------------------- Write & Summarize -----------------------------
function main() {
  const data = build();

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf8");

  // Summary
  const byType = new Map<string, number>();
  const byResource = new Map<string, number>();
  const severities = new Map<Severity, number>();

  for (const r of data) {
    byType.set(r.error_type, (byType.get(r.error_type) || 0) + 1);
    byResource.set(r.resource, (byResource.get(r.resource) || 0) + 1);
    severities.set(r.severity, (severities.get(r.severity) || 0) + 1);
  }

  console.log(`✅ Wrote ${data.length} rows → ${OUT_FILE}`);
  console.log("By error_type:", Object.fromEntries(byType));
  console.log("By resource:", Object.fromEntries(byResource));
  console.log("Severity:", Object.fromEntries(severities));
  console.log("\nAdd more rows in SEED (or swap to load from your existing list) and rerun.");
}

main();

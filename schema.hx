// Start building your schema here.
//
// The schema is used to to ensure a level of type safety in your queries.
//
// The schema is made up of Node types, denoted by N::,
// and Edge types, denoted by E::
//
// Under the Node types you can define fields that
// will be stored in the database.
//
// Under the Edge types you can define what type of node
// the edge will connect to and from, and also the
// properties that you want to store on the edge.
//
// Example:
//
// N::User {
//     Name: String,
//     Label: String,
//     Age: Int,
//     IsAdmin: Boolean,
// }
//
// E::Knows {
//     From: User,
//     To: User,
//     Properties: {
//         Since: Int,
//     }
// }
//
// For more information on how to write queries,
// see the documentation at https://docs.helix-db.com
// or checkout our GitHub at https://github.com/HelixDB/helix-db

// Core API entities
N::API {
    INDEX name: String,     // "Stripe", "OpenAI", "GitHub" - INDEX for search
    base_url: String,       // "https://api.stripe.com"
    version: String,        // "2023-10-16"
    docs_url: String
}

N::Endpoint {
    path: String,           // "/v1/customers"
    method: String,         // "POST", "GET", etc.
    summary: String,        // Brief description
    description: String     // Full description
}

N::Parameter {
    name: String,           // "customer_id"
    param_type: String,           // "string", "I32"
    required: Boolean,
    description: String,
    example: String
}

N::ErrorPattern {
    INDEX code: String,     // "authentication_failed", "invalid_request" - INDEX for search
    message: String,        // "Your API key is invalid"
    description: String,     // Full error context
    resource: String,
    method: String,
    http_status: I32,
    severity: String
}

N::Solution {
    title: String,          // "Fix authentication error"
    description: String,    // Explanation
    code_example: String,   // Working code
    source_url: String,     // GitHub issue, docs link
    upvotes: I32            // Use I32 instead of Int
}

// Vector embeddings for semantic search
V::ErrorEmbedding {
    embedding: [F64]  // Vector representation of the error
}

// Relationships
E::API_to_Endpoint {
    From: API,
    To: Endpoint,
    Properties: {}
}

E::API_to_ErrorPattern {
    From: API,
    To: ErrorPattern,
    Properties: {}
}

E::Endpoint_to_Parameter {
    From: Endpoint,
    To: Parameter,
    Properties: {}
}

E::Endpoint_to_ErrorPattern {
    From: Endpoint,
    To: ErrorPattern,
    Properties: {}
}

E::ErrorPattern_to_Solution {
    From: ErrorPattern,
    To: Solution,
    Properties: {}
}

E::ErrorPattern_to_Parameter {
    From: ErrorPattern,
    To: Parameter,
    Properties: {}
}

E::ErrorPattern_to_ErrorEmbedding {
    From: ErrorPattern,
    To: ErrorEmbedding,
    Properties: {}
}
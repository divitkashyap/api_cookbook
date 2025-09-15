// Start writing your queries here.
//
// You can use the schema to help you write your queries.
//
// Queries take the form:
//     QUERY {query name}({input name}: {input type}) =>
//         {variable} <- {traversal}
//         RETURN {variable}
//
// Example:
//     QUERY GetUserFriends(user_id: String) =>
//         friends <- N<User>(user_id)::Out<Knows>
//         RETURN friends
//
//
// For more information on how to write queries,
// see the documentation at https://docs.helix-db.com
// or checkout our GitHub at https://github.com/HelixDB/helix-db

// Create API
QUERY createAPI(name: String, base_url: String, version: String, docs_url: String) =>
    api <- AddN<API>({name: name, base_url: base_url, version: version, docs_url: docs_url})
    RETURN api

// Create error pattern - FIXED: Use all parameters or make them optional
QUERY createErrorPattern(api_id: ID, code: String, message: String, description: String, resource: String, method: String, http_status: I32, severity: String) =>
    error <- AddN<ErrorPattern>({
        code: code, 
        message: message, 
        description: description,
        resource: resource,
        method: method,
        http_status: http_status,
        severity: severity
    })
    api <- N<API>(api_id)
    api_error <- AddE<API_to_ErrorPattern>()::From(api)::To(error)
    RETURN error

// Create solution
QUERY createSolution(error_id: ID, title: String, description: String, code_example: String, source_url: String, upvotes: I32) =>
    solution <- AddN<Solution>({title: title, description: description, code_example: code_example, source_url: source_url, upvotes: upvotes})
    
    error <- N<ErrorPattern>(error_id)
    error_solution <- AddE<ErrorPattern_to_Solution>()::From(error)::To(solution)
    RETURN solution

// Create parameter - fix the parameter name
QUERY createParameter(error_id: ID, name: String, param_type: String, required: Boolean, description: String, example: String) =>
    parameter <- AddN<Parameter>({name: name, param_type: param_type, required: required, description: description, example: example})
    
    error <- N<ErrorPattern>(error_id)
    error_param <- AddE<ErrorPattern_to_Parameter>()::From(error)::To(parameter)
    RETURN parameter

// Find solutions by error code
QUERY findSolutionsByErrorCode(error_code: String) =>
    errors <- N<ErrorPattern>({code: error_code})
    solutions <- errors::Out<ErrorPattern_to_Solution>
    RETURN errors, solutions

// Get all errors for an API
QUERY getAPIErrors(api_name: String) =>
    api <- N<API>({name: api_name})
    errors <- api::Out<API_to_ErrorPattern>
    RETURN errors

// Test query for connection
QUERY testQuery() =>
    apis <- N<API>
    RETURN apis

QUERY getEndpointErrors(api_name: String, endpoint_path: String) =>
    api <- N<API>({name: api_name})
    errors <- api::Out<API_to_ErrorPattern>
    solutions <- errors::Out<ErrorPattern_to_Solution>
    RETURN errors, solutions

//Find related errors through shared parameters
QUERY findRelatedErrors(error_code: String) =>
    mainError <- N<ErrorPattern>({code: error_code})
    params <- mainError::Out<ErrorPattern_to_Parameter>
    relatedErrors <- params::In<ErrorPattern_to_Parameter>
    solutions <- relatedErrors::Out<ErrorPattern_to_Solution>
    RETURN mainError, relatedErrors, solutions

QUERY searchErrorsByVector(query_vector: [F64], k: I64) =>
    embeddings <- SearchV<ErrorEmbedding>(query_vector, k)
    errors <- embeddings::In<ErrorPattern_to_ErrorEmbedding>
    solutions <- errors::Out<ErrorPattern_to_Solution>
    RETURN errors, solutions

QUERY hybridErrorSearch(error_code: String, query_vector: [F64], k: I64) =>
    // Exact match first
    exactErrors <- N<ErrorPattern>({code: error_code})
    exactSolutions <- exactErrors::Out<ErrorPattern_to_Solution>
    
    // Vector search for similar
    embeddings <- SearchV<ErrorEmbedding>(query_vector, k)
    vectorErrors <- embeddings::In<ErrorPattern_to_ErrorEmbedding>
    vectorSolutions <- vectorErrors::Out<ErrorPattern_to_Solution>
    
    RETURN exactErrors, exactSolutions, vectorErrors, vectorSolutions
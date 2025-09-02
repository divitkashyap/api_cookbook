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

QUERY createContinent (name: String) =>
    // Add a new continent node with name
    continent <- AddN<Continent>({name: name})
    RETURN continent

QUERY createCountry (continent_id: ID, name: String, currency: String) =>
    // Add a new country node with name
    country <- AddN<Country>({name: name, currency: currency})

    continent <- N<Continent>(continent_id)
    continent_country <- AddE<Continent_to_Country>()::From(continent)::To(country)
    RETURN country

QUERY createCity (country_id: ID, name: String, description: String) =>
    city <- AddN<City>({name: name, description: description})

    country <- N<Country>(country_id)
    country_city <- AddE<Country_to_City>()::From(country)::To(city)
    RETURN city


QUERY setCaptial (country_id: ID, city_id: ID) =>
    country <- N<Country>(country_id)
    city <- N<City>(city_id)

    country_capital <- AddE<Country_to_Captial>()::From(country)::To(city)
    RETURN country_capital
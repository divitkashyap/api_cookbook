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
//     Age: Integer,
//     IsAdmin: Boolean,
// }
//
// E::Knows {
//     From: User,
//     To: User,
//     Properties: {
//         Since: Integer,
//     }
// }
//
// For more information on how to write queries,
// see the documentation at https://docs.helix-db.com
// or checkout our GitHub at https://github.com/HelixDB/helix-db

N::Continent {
    name: String,
}

N::Country {
    name: String,
    currency: String 
}

N::City {
    name: String,
    description: String
}

E::Continent_to_Country {
    From: Continent,
    To: Country,
    Properties: {
    }
}

E::Country_to_City {
    From: Country,
    To: City,
    Properties: {
    }
}

E::Country_to_Captial {
    From: Country,
    To: City,
    Properties: {
    }
}
import { ApolloServer, UserInputError, gql } from "apollo-server";
import { v1 as uuid } from "uuid";
import fetch from "node-fetch";

const personas = [
    { 
        name: 'Leon',
        apellido: 'Chanci',
        telefono: '3216750078',
        direccion: 'CR 45',
        ciudad: 'Medellín',
        id: 'fec4f300-7ee7-11ef-8970-31405a9e10b5'
    },
    { 
        name: 'Sara',
        apellido: 'Guirales',
        telefono: '3232291647',
        direccion: 'CR 45 CL 63',
        ciudad: 'Bogotá',
        id: '06ffbaf0-7ee8-11ef-8970-31405a9e10b5'
    }
]

//Definiciones de los datos
const typeDefinitions = gql`

    type PorcinoSumary {
        idPorcino: Int!
        edad: Int!
        peso: String!
        idRaza: String!
        descripcionRaza: String!
        idAlimentacion: String!
        descripcionAl: String!
        dosis: String!
        idCliente: String!
        nombres: String!
        apellidos: String!
        direccion: String!
        telefono: String!
    }

    type Direccion {
        direccion: String!
        ciudad: String!
    }

    type Persona {
        name: String!
        apellido: String!
        telefono: String!
        direccion: Direccion
        id: ID!
    }
    
    type Query {
        personaContador: Int!
        allPersonas: [Persona]!
        findPersona(name: String!): Persona
        informeGranja: [PorcinoSumary]
    }

    type Mutation {
        addPerson(
            name: String!
            apellido: String!
            telefono: String!
            direccion: String!
            ciudad: String!
        ): Persona
    }
`

//Cómo resolver los datos
const resolvers = {
    Query: {
        personaContador: () => personas.length,
        allPersonas: () => personas,
        findPersona: (root, args) => {
            const {name} = args;
            return personas.find(persona => persona.name === name);
        },
        informeGranja: () => informeGranja()
    },
    //Mutaciones
    Mutation: {
        //Actualizar persona en BD
        addPerson: (root, args) => {
            if(personas.find(p => p.name === args.name)) {
                throw new UserInputError('Error name not found', {
                    invalidArgs: args.name
                });
            };

            const newPersona = {...args, id: uuid()};
            personas.push(newPersona);
            return newPersona;
        }
    },
    Persona: {
        direccion: (root) => {
            return {
                direccion: root.direccion,
                ciudad: root.ciudad
            }
        }
    }
}

const informeGranja = async () => {
    const resp = await fetch('http://localhost:9090/granja/api/porcino/informe', {
        method: 'GET',
          //headers: {
          //  'Content-Type': 'application/json'
          //},
          //body: JSON.stringify({ query: `query { users { id name email } }` })
        });
  
    const result = await resp.json();
    console.log(result);
    return result;
}

//Servidor Apollo Server
const server = new ApolloServer({
    typeDefs: typeDefinitions,
    resolvers
})

//Subir servidor GraphQL
server.listen().then(({url}) => {
    console.log(`Server Up at ${url}`);
})
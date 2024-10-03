import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";


var porcinosArray = [];
var clientesArray = [];

//Definiciones de las entidades
const typeDefinitions = gql`
    type Cliente {
        idCliente: String
        nombres: String
        apellidos: String
        direccion: String
        telefono: String
    }

    type Raza {
        idRaza: String!
        descripcionRaza: DescRazas!
    }
        
    type Alimentacion {
        idAlimentacion: String!
        descripcionAl: String!
        dosis: String!
    }

    type Porcino {
        idPorcino: Int!
        edad: Int!
        peso: String!
        idCliente: String!
        idRaza: String!
        idAlimentacion: String!
        cliente: Cliente!
        raza: Raza!
        alimentacion: Alimentacion!
    }

    enum DescRazas {
        York
        Hamp
        Duroc
    }
    
    type Query {
        allPorcinos: [Porcino]
        countPorcinos: Int!

        allClientes: [Cliente]!
        countClients: Int!

        allRazas: [Raza]!
        allAlimentaciones: [Alimentacion]!

        informeGranja: [Porcino]!
    }

    type Mutation {
        addCliente(
            idCliente: String!
            nombres: String!
            apellidos: String!
            direccion: String!
            telefono: String!
        ): Cliente

        updateCliente(
            idCliente: String!
            nombres: String!
            apellidos: String!
            direccion: String!
            telefono: String!
        ): Cliente

        addPorcino(
            idPorcino: Int!
            edad: Int!
            peso: String!
            idCliente: String!
            idRaza: String!
            idAlimentacion: String!
        ): Porcino
    }
`

//Cómo resolver los datos
const resolvers = {
    Query: {
        informeGranja: () => informeGranja(),

        allPorcinos: () => getAllPorcinos(),
        countPorcinos : ()  =>  getCountPorcinos(),

        allClientes: () => getAllClients(),
        countClients: () => getCountClients(),

        allRazas: () => getAllRazas(),
        allAlimentaciones: () => getAllAlimentaciones(),
    },
    //Mutaciones
    Mutation: {
        //Mutation Agregar Cliente
        addCliente: (root, args) => {
            const newCliente = { ...args };
            if (clientesArray[0] != null) {
                clientesArray.push(newCliente);
            }
            return addClienteGranja(newCliente);
        },
        //Mutation Actualizar Cliente
        updateCliente: (root, args) => {
            const modifyCliente = { ...args };
            var clienteToModified = {};
            if (clientesArray[0] != null) {               
                const clienteIndex = clientesArray.findIndex(cliente  => cliente.idCliente === modifyCliente.idCliente);
                clienteToModified = clientesArray[clienteIndex];
                clienteToModified = { ...modifyCliente };
            }
            return updateClienteGranja(clienteToModified);
        },

        //Mutation Agregar Porcino
        addPorcino: (root, args) => {
            const newPorcino = { ...args };
            if (porcinosArray[0] != null) {
                porcinosArray.push(newPorcino);
            }
            return newPorcino;
        }
    },
    Porcino: {
        cliente: (root) => {
            return {
                idCliente: root.idCliente,
                nombres: root.nombres,
                apellidos: root.apellidos,
                direccion: root.direccion,
                telefono: root.telefono
            }
        },
        raza: (root) => {
            return {
                idRaza: root.idRaza,
                descripcionRaza: root.descripcionRaza
            }
        },
        alimentacion: (root) => {
            return {
                idAlimentacion: root.idAlimentacion,
                descripcionAl: root.descripcionAl,
                dosis: root.dosis
            }
        }, 
    }
}



const responseSumary = async (path) => {
    const resp = await fetch(`http://localhost:9090/granja/api/${path}`, {method: 'GET',});
    const result = await resp.json();
    return result;
}

const informeGranja = async () => {
    const path = 'porcino/informe';
    return responseSumary(path);
}


////////////////CLIENTES
const getAllClients = async () => {
    if(clientesArray[0] != null) {
        return clientesArray;
    } else {
        return allClientesGranja();
    }
}
const allClientesGranja = async () => {
    const resp = await fetch(`http://localhost:9090/granja/api/cliente`, {method: 'GET',});
    const result = await resp.json();
    clientesArray = result;
    return result;
}
const getCountClients = async () => {
    const clientes = await getAllClients();
    return clientes.length > 0 ? clientes.length : 0;
}
const addClienteGranja = async (newCliente) => {
    const resp = await fetch('http://localhost:9090/granja/api/cliente', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCliente),
        });
    const result = await resp.json();
    return result;
}

const updateClienteGranja= async (updateCliente) => {
    const resp = await fetch('http://localhost:9090/granja/api/cliente', {
        method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateCliente),
        });
    const result = await resp.json();
    return result;
}

////////////////PORCINOS
const getAllPorcinos = async () => {
    if(porcinosArray[0] != null) {
        return porcinosArray;
    } else {
        return allPorcinosGranja();
    }
}
const allPorcinosGranja = async () => {
    const resp = await fetch(`http://localhost:9090/granja/api/porcino`, {method: 'GET',});
    const result = await resp.json();
    porcinosArray = result;
    return result;
}
const getCountPorcinos = async () => {
    const porcinos = await getAllPorcinos();
    return porcinos.length > 0 ? porcinos.length : 0;
}


////////////////RAZAS
const getAllRazas = async () => {
    const path = 'raza';
    return responseSumary(path);
}

////////////////ALIMENTACIONES
const getAllAlimentaciones = async () => {
    const path = 'alimentacion';
    return responseSumary(path);
}




////////////////Servidor Apollo Server
const server = new ApolloServer({
    typeDefs: typeDefinitions,
    resolvers
})
////////////////Subir servidor GraphQL
server.listen().then(({url}) => {
    console.log(`Server Up at ${url}`);
})
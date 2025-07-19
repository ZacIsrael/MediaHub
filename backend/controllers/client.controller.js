// This file is responsible for handling API requests that come in for clients

import { CreateClientDTO } from "../dtos/client.dto.js";
import { clientService } from "../services/client.service.js";

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// called for (POST /api/clients/) route
export const createClient = async (req, res) => {
  // data transfer object (object that will contained the processed request)
  let dto;

  // process the body of the request (see client.dto.js)
  try {
    dto = new CreateClientDTO(req.body);
  } catch (err) {
    // Error stems from client-side/body of the request
    // see (clients.dto.js) to see all possible error messages
    res.status(400).json({
      error: `Bad Request (POST /api/clients/): ${err.message}`,
      stack: err.stack,
    });
  }

  try {
    // inserts the newly created clients with the fields from the body of
    // the request into the clients table in the postgreSQL database (see clients.service.ts)
    const result = await clientService.createClient(dto);

    // "RETURNING * " is in the insertion query so the entry in the clients table should be returned
    // Insertion into the clients table was successful
    res.status(201).json({
      message: `Successfully inserted client into the ${clientsTable} table`,
      // just incase I need the added client on the frontend for whatever reason
      client: result.rows[0],
    });
  } catch (err) {
    // Error inserting the client into the postgreSQL database
    res.status(500).json({
      error: `Server Error (POST /api/clients/): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (GET /api/clients/) route
export const getAllClients = async (req, res) => {
  try {
    // retreive all of the clients
    const clientResults = await clientService.getAllClients();

    res.status(200).json({
      message:
        // different message is returned in the response depending on if there are any clients in the database
        clientResults.rows.length === 0
          ? `The ${clientsTable} table is empty`
          : "Successfully retreived all clients from the 'clients' table in the postgreSQL database.",
      // return the clients in the repsonse
      clients: clientResults.rows,
    });
  } catch (err) {
    // error occured when retreiving all clients from the clients table in the postgreSQL database
    res.status(500).json({
      error: `Server Error (GET /api/clients/): ${err.message}`,
      stack: err.stack,
    });
  }
};

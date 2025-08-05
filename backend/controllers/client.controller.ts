// This file is responsible for handling API requests that come in for clients

import { Request, Response } from "express";
import { CreateClientDTO } from "../dtos/client.dto";
import { clientService } from "../services/client.service";
import { Client } from "../types/client.interface";

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// called for (POST /api/clients/) route
export const createClient = async (req: Request, res: Response) => {
  // debugging
  console.log("🚨 POST /api/clients hit");
  
  // data transfer object (object that will contained the processed request)
  let dto: CreateClientDTO;

  // process the body of the request (see client.dto.js)
  try {
    dto = new CreateClientDTO(req.body);
  } catch (err: any) {
    // Error stems from client-side/body of the request
    // see (clients.dto.js) to see all possible error messages
    return res.status(400).json({
      error: `Bad Request (POST /api/clients/): ${err.message}`,
      stack: err.stack,
    });
  }

  try {
    // inserts the newly created clients with the fields from the body of
    // the request into the clients table in the postgreSQL database (see clients.service.ts)
    const result = await clientService.createClient(dto);

    const client: Client = result.rows[0];

    // "RETURNING * " is in the insertion query so the entry in the clients table should be returned
    // Insertion into the clients table was successful
    res.status(201).json({
      message: `Successfully inserted client into the ${clientsTable} table`,
      // just incase I need the added client on the frontend for whatever reason
      client,
    });
  } catch (err: any) {
    // Error inserting the client into the postgreSQL database
    res.status(500).json({
      error: `Server Error (POST /api/clients/): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (GET /api/clients/) route
export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    // debug
    console.log("🚨 GET /api/clients hit");
    // retreive all of the clients
    const clientResults = await clientService.getAllClients();

    // Explicitly type result.rows to get proper autocomplete and error checking
    // const clients: Client[] = clientResults.rows;

    res.status(200).json({
      message:
        // different message is returned in the response depending on if there are any clients in the database
        clientResults.rows.length === 0
          ? `The ${clientsTable} table is empty`
          : "Successfully retreived all clients from the 'clients' table in the postgreSQL database.",
      // return the clients in the repsonse
      clients: clientResults.rows,
    });
  } catch (err: any) {
    // error occured when retreiving all clients from the clients table in the postgreSQL database
    res.status(500).json({
      error: `Server Error (GET /api/clients/): ${err.message}`,
      stack: err.stack,
    });
  }
};

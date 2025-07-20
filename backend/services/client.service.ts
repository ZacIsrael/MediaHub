// This file handles the interaction between the API & the clients table in the postgreSQL database

import { db } from "../database";
import { CreateClientDTO } from "../dtos/client.dto";
import { Client } from "../types/client.interface";

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";
export const clientService = {
  // ts ensure that this dto parameter passed in is of type CreateClientDTO (see client.dto.ts)
  async createClient(dto: CreateClientDTO): Promise<{ rows: Client[]}> {
    // insert a client into the clients table with cleaned up parameters passed in
    // from the data transfer object (dto) from client.dto.ts
    // RETURNING * includes the inserted client in the result 
    return await db.query(
      `INSERT INTO ${clientsTable} (name, email, phone) VALUES ($1, $2, $3) RETURNING *`,
      [dto.name, dto.email, dto.phone]
    );
  },

  async getAllClients(): Promise<{rows: Client[]}>{
    // retreives all of the clients from the clients table in the postgreSQL database
    return await db.query(`SELECT * FROM ${clientsTable}`);
  }
};

// This file handles the interaction between the API & the clients table in the postgreSQL database

import { db } from "../database.js";

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";
export const clientService = {
  async createClient(dto) {
    // insert a client into the clients table with cleaned up parameters passed in
    // from the data transfer object (dto) from client.dto.js
    return await db.query(
      `INSERT INTO ${clientsTable} (name, email, phone) VALUES ($1, $2, $3) RETURNING *`,
      [dto.name, dto.email, dto.phone]
    );
  },

  async getAllClients(){
    // retreives all of the clients from the clients table in the postgreSQL database
    return await db.query(`SELECT * FROM ${clientsTable}`);
  }
};

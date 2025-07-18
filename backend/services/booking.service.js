// This file handles the interaction between the API & the bookings table in the postgreSQL database

import { db } from "../database.js";
import { itemExistsById } from "../utils/helpers.js";

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

export const bookingService = {
  async createBooking(dto) {
    // insert a booking into the bookings table with cleaned up parameters passed in
    // from the data transfer object (dto) from boking.dto.js
    // RETURNING * includes the inserted booking in the result
    return await db.query(
      `INSERT INTO ${bookingsTable} (client_id, event_date, event_type, price, status) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.client_id, dto.event_date, dto.event_type, dto.price, dto.status]
    );
  },

  async getAllBookings(){
    // reterieve all of the bookings (SELECT * FROM bookings)
    return await db.query(`SELECT * FROM ${bookingsTable}`);
  },

  async getBookingById(id){
    return await itemExistsById(id, bookingsTable, db);
  }
};

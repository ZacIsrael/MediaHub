// This file handles the interaction between the API & the bookings table in the postgreSQL database

import { CreateBookingDTO } from "../dtos/booking.dto";
import { db } from "../database";
import { itemExistsById } from "../utils/helpers";
import { Booking } from "../types/booking.interface";

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

export const bookingService = {
  // ts ensure that this dto parameter passed in is of type CreateBookingtDTO (see booking.dto.ts)
  async createBooking(dto: CreateBookingDTO): Promise<{ rows: Booking[] }> {
    // insert a booking into the bookings table with cleaned up parameters passed in
    // from the data transfer object (dto) from boking.dto.js
    // RETURNING * includes the inserted booking in the result
    return await db.query(
      `INSERT INTO ${bookingsTable} (client_id, event_date, event_type, price, status) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.client_id, dto.event_date, dto.event_type, dto.price, dto.status]
    );
  },

  async getAllBookings(): Promise<{ rows: Booking[] }> {
    // reterieve all of the bookings (SELECT * FROM bookings)
    return await db.query(`SELECT * FROM ${bookingsTable}`);
  },

  // itemExistsById returns a boolean value (indicates whether or not the item exists) & the item itself
  async getBookingById(id: number): Promise<{ booleanVal: boolean; item: Booking | null}> {
    return await itemExistsById(id, bookingsTable, db);
  },
};

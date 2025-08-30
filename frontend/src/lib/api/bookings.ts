// This file contains the API functions for the bookings (CRUD); interacts with the backend

// Import the axios library, a promise-based HTTP client
import api from "./axios";

// define structure of a booking & response for getBookingById API call
import { type Booking, type GetBookingByIdResponse } from "./types";

// structure for basic pagination
export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type ListBookingsQuery = { page?: number; limit?: number; q?: string };

export async function getBookings(
  params: ListBookingsQuery = {}
): Promise<Paginated<Booking>> {
  // data retreived from GET request sent to the backend API
  const { data } = await api.get("/api/bookings", { params });

  // Response structure: { message: string, bookings: Booking[] }
  if (Array.isArray(data.bookings)) {
    const items = data.bookings;
    return {
      items,
      page: params.page ?? 1,
      limit: params.limit ?? items.length,
      total: items.length,
    };
  }

  // fallback in case shape changes
  return { items: [], page: 1, limit: 10, total: 0 };
}

// retreive a booking by its id
export async function getBookingById(id: number): Promise<GetBookingByIdResponse> {
  // data retreived from GET request sent to the backend API
  const { data } = await api.get<GetBookingByIdResponse>(`/api/bookings/${id}`);
  // if found, data/response structure = { booking: booking-object (id, client_id, event_date, etc.)}
  // if booking with id does not exist, data/response structure = { message: string, booking: null}
  // return the retreived booking
  return data;
}

// create a booking
// Define the structure for the parameter of this function (see booking.dto file in backend)
// - client_id: required, number
// - event_date: required, string (date)
// - event_type: required, string
// - price: required, number
export type CreateBookingInput = { client_id: number; event_date: string, event_type: string; price: number}
export async function createBooking(
    payload: CreateBookingInput
): Promise<Booking> {
    const { data } = await api.post("/api/bookings", payload);
    return data;
}



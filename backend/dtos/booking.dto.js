import { isValidPrice } from "../utils/helpers.js";

// This file validates and sanitizes the data coming from API requests for bookings
export class CreateBookingDTO {
  constructor({ client_id, event_date, event_type, price }) {
    // ensure that event_date & event_type are strings and not empty
    if (typeof event_date !== "string" || event_date.trim().length === 0) {
      throw new Error(
        "Error (POST /api/bookings/): 'event_date' field must be a non-empty string."
      );
    }

    if (typeof event_type !== "string" || event_type.trim().length === 0) {
      throw new Error(
        "Error (POST /api/bookings/): 'event_type' field must be a non-empty string."
      );
    }

    // check to see if the price is valid
    if (!isValidPrice(price)) {
      throw new Error(
        "Error (POST /api/bookings/): 'price' field must be a valid dollar amount. Re-enter it with no more than 10 digits in front of the decimal and only 2 digits after the decimal"
      );
    }

    // check to see if the date is valid
    if(isNaN(new Date(event_date).getTime())){
        // date is not in the correct format so throw an error
        throw new Error ("Error (POST /api/bookings/): 'event_date' string is incorrectly formatted. Please use ISO format like 'YYYY-MM-DDTHH:mm:ssZ'");
    }
    // postgreSQL expects a date object for the event_date field
    const dateToBeAdded = new Date(event_date);

    // Assign validated and cleaned values to the DTO instance
    // we'll check if client id is valid in the service & controller files
    this.client_id = client_id;
    this.event_date = dateToBeAdded;
    this.event_type = event_type.trim();
    this.price = price;
    this.status = "PENDING";
  }
}

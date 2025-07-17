// This file validates and sanitizes the data coming from API requests for clients
export class CreateClientDTO {
  constructor({ name, email, phone = "" }) {
    // check for empty strings
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new Error(
        "Error (POST /api/clients/): 'name' field must be a non-empty string."
      );
    }
    if (typeof email !== "string" || email.trim().length === 0) {
      throw new Error(
        "Error (POST /api/clients/): 'email' field must be a non-empty string."
      );
    }
    // phone is optional but if it exists, ensure that it is a string and exactly 10 digits long
    if (typeof phone !== "string") {
      throw new Error(
        "Error (POST /api/clients/): 'phone' field must be a non-empty string."
      );
    }

    if (phone.trim().length !== 10) {
      throw new Error(
        "Error (POST /api/clients/): 'phone' # must be exactly 10 digits."
      );
    }

    // Assign validated and cleaned values to the DTO instance
    this.name = name.trim();
    this.email = email.trim();
    this.phone = phone.trim();
  }
}

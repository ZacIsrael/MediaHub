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
    // phone is optional, so it's default is an empty string if it was not passed in the body of the request
    if (phone !== "") {
      // if phone is not an empty string, that means that it was sent in the request
      if (typeof phone !== "string") {
        // if what was sent in the phone field was not of type string, throw an error
        throw new Error(
          "Error (POST /api/clients/): 'phone' field must be a non-empty string."
        );
      }

      // If the code reaches this point, then the phone field submitted in the request is
      // in fact a string so ensure that it is exactly 10 digits long
      if (phone.trim().length !== 10) {
        throw new Error(
          "Error (POST /api/clients/): 'phone' # must be exactly 10 digits."
        );
      }
    }

    // Assign validated and cleaned values to the DTO instance
    this.name = name.trim();
    this.email = email.trim();
    this.phone = phone.trim();
  }
}

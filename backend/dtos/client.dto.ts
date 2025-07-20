// This file validates and sanitizes the data coming from API requests for clients

// This interface defines the expected shape of the input passed into CreateClientDTO.
// It provides compile-time type safety and enables IDE autocomplete.
interface CreateClientInput {
  name: string;
  email: string;
  // phone has a '?' at the end because it's optional
  phone?: string;
}


export class CreateClientDTO {

  // Declare class properties with their expected types 
  name: string;
  email: string;
  phone: string;

  // Ensure that the object passed to this constructor matches the shape of CreateClientInput
  constructor({ name, email, phone = "" }: CreateClientInput) {
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

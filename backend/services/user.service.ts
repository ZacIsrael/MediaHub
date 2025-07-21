// This file handles the interaction between the API & the users table in the postgreSQL database

import { db } from "../database";
import { CreateUserDTO } from "../dtos/user.dto";
import { IUser } from "../types/user.interface";

// constants for tables in the postgreSQL database
const usersTable = "users";

export const usersService = {
  // ts ensure that this dto parameter passed in is of type CreateUserDTO (see users.dto.ts)
  // returns a promise of row(s) of type IUser (see IUser interface user.interface.t)
  async createUser(dto: CreateUserDTO): Promise<{ rows: IUser[] }> {
    // insert a user into the users table with cleaned up parameters passed in
    // from the data transfer object (dto) from user.dto.ts
    // RETURNING * includes the inserted user in the result
    return await db.query(
      `INSERT INTO ${usersTable} (email, password_hash, provider, provider_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [dto.email, dto.password_hash, dto.provider, dto.provider_id]
    );
  },

  // loginUser will go here
  
};

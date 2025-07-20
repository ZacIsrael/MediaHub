// This file contains any auxillary functions

// Import type for PostgreSQL query result type safety
import { Client } from "pg";

// Define the shape of the object that itemExistsById returns
interface ItemExistsResult<T> {
  // boolean value that indicates whether or not the item has been found or exists
  booleanVal: boolean;
  // the item itself 
  item: T | null;
}
// Checks to see if an item with specified id exists in a given table 
// in a given postgreSQL database
// returns an object with a boolean value and the item (if it exists)
export async function itemExistsById<T = any>(id: number, tableName: string, db: Client): Promise<ItemExistsResult<T>> {
  try {
    const result = await db.query(
      `SELECT * FROM ${tableName} WHERE id = ($1)`,
      [id]
    );
    if (result.rowCount === 1) {
      console.log("itemExistsById(): item = ", result.rows[0]);
      return {
        booleanVal: true,
        item: result.rows[0],
      };
    } else if (result.rowCount !== null && result.rowCount > 1) {
      console.error(
        `There is more than one item in the ${tableName} table with id = ${id}`
      );
      return {
        booleanVal: false,
        item: null,
      };
    } else {
      console.error(
        `There is no item in the ${tableName} table with id = ${id}`
      );
      return {
        booleanVal: false,
        item: null,
      };
    }
  } catch (err: any) {
    console.error("Error: ", err.message);
    return {
      booleanVal: false,
      item: null,
    };
  }
}

// checks to see if a number is in the correct format for $
// this function returns a boolan
export function isValidPrice(price: number): boolean {
  // check to see if price is actually a number
  if (isNaN(price)) {
    return false;
  }

  // Convert to string and split into whole/decimal parts
  const [integerPart, decimalPart = ""] = price.toString().split(".");

  // Calculate the total number of digits in the price value (excluding the decimal point and any negative sign)
  // - integerPart: the whole number portion of the price (e.g., "1234" from "1234.56")
  // - decimalPart: the fractional portion after the decimal (e.g., "56")
  // - .replace("-", "") removes the minus sign if it's a negative value (we only want to count digits)
  // - .length on each part counts the number of characters (digits)
  // This is used to ensure the total number of digits (both before and after the decimal)
  // does not exceed the allowed precision of NUMERIC(10,2) in PostgreSQL
  const totalDigits = integerPart.replace("-", "").length + decimalPart.length;

  // returns true if there are 10 or less digits in front of the decimal AND there are no more than 2 digits after the decimal
  return totalDigits <= 10 && decimalPart.length <= 2;
}

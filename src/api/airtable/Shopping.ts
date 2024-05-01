import { airtable, Airtable, Select } from "./Airtable";
import { FieldSet, Records } from "airtable"; // Assuming FieldSet is available to import

// Define an interface for the Airtable record fields for the "Shopping" table
interface ShoppingItem {
  id: string; // Auto-computed ID, as provided by Airtable
  item?: string; // Single line text for the item name
  quantity?: string; // Single line text for the quantity of the item
  category?: string; // Single line text for the category of the item
  bought?: boolean; // Checkbox indicating whether the item was bought
  recipeIds?: string[]; // Array of linked record IDs from the Recipes table
}

interface ShoppingFields {
  item: string;
  quantity: string;
  category: string;
  bought?: boolean;
  recipeIds?: string[];
}

interface CreateShoppingItem {
  item: string;
  quantity: string;
  category: string;
  bought?: boolean;
  recipeIds?: string[];
}

// Interface to represent a record as returned by Airtable with metadata
interface AirtableRecord {
  id: string;
  fields: ShoppingItem;
}

// Interface for responses from Airtable containing multiple records
interface AirtableResponse {
  records: AirtableRecord[];
}

interface ShoppingCreate {
  fields: Omit<ShoppingItem, "id">;
}

interface AirtableBatchData {
  ingredientsToUpdate?: AirtableRecord[];
  ingredientsToAdd?: ShoppingCreate[];
  ingredientsToRemove?: string[];
}

// Define an interface for updating a record in the "Shopping" table
interface UpdateShoppingItem {
  id: string;
  fields: Partial<ShoppingItem>;
}

/**
 * Fetches shopping item records from the "Shopping" table with optional filters.
 * @param filters Additional options for querying the "Shopping" table.
 * @returns A promise resolving to a list of shopping item records.
 */
async function getShoppingRecords(
  filters?: Airtable.SelectOptions<Select>
): Promise<ShoppingItem[]> {
  const recordsList: ShoppingItem[] = [];
  return new Promise((resolve, reject) => {
    airtable("Shopping") // Specific table name for clarity and reusability
      .select(filters || {})
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            recordsList.push({
              id: record.id,
              item: record.fields.item as string,
              quantity: record.fields.quantity as string,
              category: record.fields.category as string,
              bought: record.fields.bought as boolean, // Handling the boolean for unchecked cases
              recipeIds: record.fields.recipeIds as string[], // Ensuring an array even if it's empty
            });
          });
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }
          resolve(recordsList);
        }
      );
  });
}

/**
 * Updates a shopping item record in the "Shopping" table.
 * @param {UpdateShoppingItem} updateData The ID of the item to update and the fields to be updated.
 * @returns {Promise<ShoppingItem>} A promise resolving to the updated shopping item record.
 */
async function updateShoppingItem(
  updateData: UpdateShoppingItem
): Promise<ShoppingItem> {
  try {
    const updatedRecord = await airtable("Shopping").update([
      {
        id: updateData.id,
        fields: updateData.fields,
      },
    ]);
    const updatedItem: ShoppingItem = {
      id: updatedRecord[0].id,
      item: updatedRecord[0].fields.item as string,
      quantity: updatedRecord[0].fields.quantity as string,
      category: updatedRecord[0].fields.category as string,
      bought: updatedRecord[0].fields.bought as boolean,
      recipeIds: updatedRecord[0].fields.recipeIds as string[],
    };
    console.log(`Updated record ID: ${updatedItem.id}`);
    return updatedItem;
  } catch (error) {
    console.error("Failed to update the record:", error);
    throw error;
  }
}

/**
 * Adds a new shopping item record in the "Shopping" table.
 * @param {CreateShoppingItem} shoppingData The data for the new shopping item to be created.
 * @returns {Promise<ShoppingItem>} A promise resolving to the newly created shopping item record.
 */
async function addShoppingItem(
  shoppingData: CreateShoppingItem
): Promise<ShoppingItem> {
  try {
    // Convert shoppingData to a more generic type compatible with Airtable's expected input
    const airtableData: FieldSet = {
      item: shoppingData.item,
      quantity: shoppingData.quantity,
      category: shoppingData.category,
      bought: shoppingData.bought,
      recipeIds: shoppingData.recipeIds,
    };

    const createdRecords: Records<FieldSet> = await airtable("Shopping").create(
      [{ fields: airtableData }]
    );

    if (createdRecords && createdRecords.length > 0) {
      const record = createdRecords[0];
      const newShoppingItem: ShoppingItem = {
        id: record.id,
        item: record.fields.item as string,
        quantity: record.fields.quantity as string,
        category: record.fields.category as string,
        bought: record.fields.bought as boolean,
        recipeIds: record.fields.recipeIds as string[],
      };
      console.log(`Created new shopping item record ID: ${newShoppingItem.id}`);
      return newShoppingItem;
    } else {
      throw new Error("No records were created.");
    }
  } catch (error) {
    console.error("Failed to create the shopping item:", error);
    throw error;
  }
}

// function processAirtableBatch(
//   operation: string,
//   records: any[],
//   doneCallback: (err: any, records?: AirtableBatchData[]) => void
// ) {
//   let recordChunks = [];
//   for (let i = 0; i < records.length; i += 10) {
//     recordChunks.push(records.slice(i, i + 10));
//   }

//   recordChunks.forEach((chunk) => {
//     switch (operation) {
//       case "create":
//         airtable("Shopping").create(chunk, doneCallback);
//         break;
//       case "update":
//         airtable("Shopping").update(chunk, doneCallback);
//         break;
//       case "destroy":
//         airtable("Shopping").destroy(chunk, doneCallback);
//         break;
//       default:
//         console.error("Unsupported operation");
//     }
//   });
// }

// function insertToAirtable(data: {
//   ingredientsToUpdate?: any[];
//   ingredientsToAdd?: any[];
//   ingredientsToRemove?: any[];
// }) {
//   if (data.ingredientsToUpdate && data.ingredientsToUpdate.length) {
//     processAirtableBatch("update", data.ingredientsToUpdate, (err, records) => {
//       if (err) {
//         console.error("Update Error:", err);
//         return;
//       }
//       records.forEach((record) => console.log("Updated:", record.getId()));
//     });
//   }

//   if (data.ingredientsToAdd && data.ingredientsToAdd.length) {
//     processAirtableBatch("create", data.ingredientsToAdd, (err, records) => {
//       if (err) {
//         console.error("Create Error:", err);
//         return;
//       }
//       records.forEach((record) => console.log("Created:", record.getId()));
//     });
//   }

//   if (data.ingredientsToRemove && data.ingredientsToRemove.length) {
//     processAirtableBatch(
//       "destroy",
//       data.ingredientsToRemove,
//       (err, deletedRecords) => {
//         if (err) {
//           console.error("Destroy Error:", err);
//           return;
//         }
//         console.log("Deleted:", deletedRecords.length, "records");
//       }
//     );
//   }
// }

// Export the function for use in other components
export { getShoppingRecords, updateShoppingItem, addShoppingItem };

export type {
  ShoppingItem,
  UpdateShoppingItem,
  ShoppingCreate,
  AirtableRecord,
  AirtableResponse,
  ShoppingFields,
};

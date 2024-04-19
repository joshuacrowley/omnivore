import { airtable, Airtable, Select } from "./Airtable";

// Define an interface for the Airtable record fields for the "Shopping" table
interface ShoppingItem {
  id: string; // Auto-computed ID, as provided by Airtable
  item?: string; // Single line text for the item name
  quantity?: string; // Single line text for the quantity of the item
  category?: string; // Single line text for the category of the item
  bought?: boolean; // Checkbox indicating whether the item was bought
  recipeIds?: string[]; // Array of linked record IDs from the Recipes table
}
interface AirtableRecord {
  id: string;
  fields: Omit<ShoppingItem, "id">;
}

interface AirtableCreateRecord {
  fields: Omit<ShoppingItem, "id">;
}

interface AirtableBatchData {
  ingredientsToUpdate?: AirtableRecord[];
  ingredientsToAdd?: AirtableCreateRecord[];
  ingredientsToRemove?: string[];
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
export { getShoppingRecords };

export type { ShoppingItem };

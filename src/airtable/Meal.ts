import { idText } from "typescript";
import { airtable, Airtable, Select } from "./Airtable";

// Define an interface for the Airtable record fields for the "Shopping" table
interface MealItem {
  id: string; // Auto-computed ID, as provided by Airtable
  name?: string; // Single line text for the item name
  runsheet?: string; // Single line text for the quantity of the item
  date?: string; // Single line text for the category of the item
  ready: boolean; // Checkbox indicating whether the item was bought
  recipeIds?: string[]; // Array of linked record IDs from the Recipes table
}

/**
 * Fetches shopping item records from the "Shopping" table with optional filters.
 * @param filters Additional options for querying the "Shopping" table.
 * @returns A promise resolving to a list of shopping item records.
 */
async function getMeals(
  filters?: Airtable.SelectOptions<Select>
): Promise<MealItem[]> {
  const recordsList: MealItem[] = [];
  return new Promise((resolve, reject) => {
    airtable("Meals") // Specific table name for clarity and reusability
      .select(
        filters || {
          fields: ["name", "runsheet", "id", "date", "ready", "recipeIds"],
        }
      )
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            recordsList.push({
              id: record.id,
              name: record.fields.name as string,
              runsheet: record.fields.runsheet as string,
              date: record.fields.date as string,
              ready: record.fields.ready as boolean, // Handling the boolean for unchecked cases
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

// Export the function for use in other components
export { getMeals };

export type { MealItem };

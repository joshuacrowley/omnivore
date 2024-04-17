import Airtable from "airtable";

// Define an interface for the Airtable record fields for the "Shopping" table
interface ShoppingItem {
  id: string; // Auto-computed ID, as provided by Airtable
  item?: string; // Single line text for the item name
  quantity?: string; // Single line text for the quantity of the item
  category?: string; // Single line text for the category of the item
  bought?: boolean; // Checkbox indicating whether the item was bought
  recipeIds?: string[]; // Array of linked record IDs from the Recipes table
}

interface Select {
  maxRecords?: number;
}

// Airtable configuration with TypeScript typing for the environment variables
const airtableBase = new Airtable({
  apiKey: process.env.REACT_APP_AIRTABLE_API_KEY as string,
}).base(process.env.REACT_APP_AIRTABLE_BASE as string);

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
    airtableBase("Shopping") // Specific table name for clarity and reusability
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

// Export the function for use in other components
export { getShoppingRecords };

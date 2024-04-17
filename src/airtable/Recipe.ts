import { airtable, Airtable, Select } from "./Airtable";

// Define an interface for attachment objects
interface Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  thumbnails?: {
    small: {
      url: string;
      width: number;
      height: number;
    };
    large: {
      url: string;
      width: number;
      height: number;
    };
  };
}

// Define an interface for the Airtable record fields for the "Recipes" table
interface RecipeItem {
  id: string;
  name?: string;
  ingredients?: string;
  method?: string;
  serves?: number;
  photo?: Attachment[];
  recipeId?: string;
  meals?: string[];
  shopping?: string[];
}

/**
 * Fetches recipe records from the "Recipes" table with optional filters.
 * @param filters Additional options for querying the "Recipes" table.
 * @returns A promise resolving to a list of recipe records.
 */
async function getRecipes(
  filters?: Airtable.SelectOptions<Select>
): Promise<RecipeItem[]> {
  const recordsList: RecipeItem[] = [];
  return new Promise((resolve, reject) => {
    airtable("Recipes")
      .select(
        filters || {
          maxRecords: 10,
        }
      )
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            recordsList.push({
              id: record.id,
              name: record.fields.name as string,
              ingredients: record.fields.ingredients as string,
              method: record.fields.method as string,
              serves: record.fields.serves as number,
              photo: record.fields.photo as Attachment[], // Optional, may not always be present
              recipeId: record.id, // Using the record's own ID for this field
              meals: record.fields.meals as string[],
              shopping: record.fields.shopping as string[],
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

async function getRecipeById(recipeId: string): Promise<RecipeItem | null> {
  try {
    const record = await airtable("Recipes").find(recipeId);
    if (!record || !record.fields) return null;

    return {
      id: record.id,
      name: record.fields.name as string,
      ingredients: record.fields.ingredients as string,
      method: record.fields.method as string,
      serves: record.fields.serves as number,
      photo: record.fields.photo as Attachment[],
      recipeId: record.id,
      meals: record.fields.meals as string[],
      shopping: record.fields.shopping as string[],
    };
  } catch (err) {
    console.error("Error fetching recipe by ID:", err);
    throw err; // Consider handling more gracefully depending on your application needs
  }
}

// Export the function for use in other components
export { getRecipes, getRecipeById };

export type { RecipeItem };

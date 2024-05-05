import { airtable, Airtable, Select } from "./Airtable";
import { FieldSet, Records, Attachment } from "airtable"; // Assuming FieldSet is available to import

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

interface CreateRecipeItem {
  name: string;
  ingredients: string;
  method: string;
  serves: number;
  photo?: Attachment[];
  meals?: string[];
  shopping?: string[];
}

interface UpdateRecipeItem {
  id: string;
  fields: {
    name?: string;
    ingredients?: string;
    method?: string;
    serves?: number;
    photo?: Attachment[];
    meals?: string[];
    shopping?: string[];
  };
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
      .select(filters || {})
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

/**
 * Adds a new recipe item record in the "Recipes" table.
 * @param {CreateRecipeItem} recipeData The data for the new recipe item to be created.
 * @returns {Promise<RecipeItem>} A promise resolving to the newly created recipe item record.
 */
async function addRecipe(recipeData: CreateRecipeItem): Promise<RecipeItem> {
  try {
    // Convert recipeData to a more generic type compatible with Airtable's expected input
    const airtableData: FieldSet = {
      name: recipeData.name,
      ingredients: recipeData.ingredients,
      method: recipeData.method,
      serves: recipeData.serves,
      photo: recipeData.photo, // Ensure this is formatted correctly for Airtable
      meals: recipeData.meals,
      shopping: recipeData.shopping,
    };

    const markdownContent = `# ${recipeData.name}\n\n- Serves: ${
      recipeData.serves
    }\n\n## Ingredients\n${recipeData.ingredients}\n\n## Method\n${
      recipeData.method
    }\n\n*Recipe created on: ${new Date().toISOString().slice(0, 10)}*`;
    const blob = new Blob([markdownContent], { type: "text/markdown" });

    const createdRecords: Records<FieldSet> = await airtable("Recipes").create([
      { fields: airtableData },
    ]);

    if (createdRecords && createdRecords.length > 0) {
      const record = createdRecords[0];
      const newRecipe: RecipeItem = {
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
      console.log(`Created new recipe record ID: ${newRecipe.id}`);
      return newRecipe;
    } else {
      throw new Error("No records were created.");
    }
  } catch (error) {
    console.error("Failed to create the recipe item:", error);
    throw error;
  }
}

/**
 * Updates existing recipe item records in the "Recipes" table.
 * @param {UpdateRecipeItem[]} updates Array of recipe data with ids for updates.
 * @returns {Promise<RecipeItem[]>} A promise resolving to the list of updated recipe item records.
 */
async function updateRecipes(
  updates: UpdateRecipeItem[]
): Promise<RecipeItem[]> {
  try {
    const formattedUpdates = updates.map((update) => ({
      id: update.id,
      fields: {
        name: update.fields.name,
        ingredients: update.fields.ingredients,
        method: update.fields.method,
        serves: update.fields.serves,
        photo: update.fields.photo,
        meals: update.fields.meals,
        shopping: update.fields.shopping,
      },
    }));

    console.log(formattedUpdates);

    const updatedRecords: Records<FieldSet> = await airtable("Recipes").update(
      formattedUpdates
    );

    return updatedRecords.map((record) => ({
      id: record.id,
      name: record.fields.name as string,
      ingredients: record.fields.ingredients as string,
      method: record.fields.method as string,
      serves: record.fields.serves as number,
      photo: record.fields.photo as Attachment[],
      recipeId: record.id,
      meals: record.fields.meals as string[],
      shopping: record.fields.shopping as string[],
    }));
  } catch (error) {
    console.error("Failed to update recipe items:", error);
    throw error; // Depending on your application needs, you may want to handle this error differently.
  }
}

// Export the function for use in other components
export { getRecipes, getRecipeById, addRecipe, updateRecipes };

export type { RecipeItem };

import { airtable, Airtable, Select } from "./Airtable";
import { FieldSet, Records } from "airtable"; // Assuming FieldSet is available to import

// Define an interface for the Airtable record fields for the "Shopping" table
interface MealItem {
  id: string; // Auto-computed ID, as provided by Airtable
  name?: string; // Single line text for the item name
  runsheet?: string; // Single line text for the quantity of the item
  date?: string; // Single line text for the category of the item
  ready: boolean; // Checkbox indicating whether the item was bought
  recipeIds?: string[]; // Array of linked record IDs from the Recipes table
}

// Define an interface for the update data
interface UpdateMealItem {
  id: string; // ID of the meal item to update
  fields: Partial<MealItem>; // Partial type, allowing optional updates to any field
}

// Define an interface for creating a new meal item
interface CreateMealItem {
  name?: string;
  runsheet?: string;
  date?: string;
  ready: boolean;
  recipeIds?: string[];
}

// Define an interface for the Meal Plan (if not already defined)
interface MealPlanItem {
  id: string;
  name?: string;
  runsheet?: string;
  date?: string;
  ready: boolean;
  recipeIds?: string[];
  // Include other relevant fields as necessary
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

/**
 * Updates a meal item record in the "Meals" table.
 * @param {UpdateMealItem} updateData The ID of the item to update and the fields to be updated.
 * @returns {Promise<MealItem>} A promise resolving to the updated meal item record.
 */
async function updateMealItem(updateData: UpdateMealItem): Promise<MealItem> {
  try {
    const updatedRecords = await airtable("Meals").update([
      {
        id: updateData.id,
        fields: updateData.fields,
      },
    ]);
    const updatedMeal: MealItem = {
      id: updatedRecords[0].id,
      name: updatedRecords[0].fields.name as string,
      runsheet: updatedRecords[0].fields.runsheet as string,
      date: updatedRecords[0].fields.date as string,
      ready: updatedRecords[0].fields.ready as boolean,
      recipeIds: updatedRecords[0].fields.recipeIds as string[],
    };
    console.log(`Updated meal record ID: ${updatedMeal.id}`);
    return updatedMeal;
  } catch (error) {
    console.error("Failed to update the meal item:", error);
    throw error;
  }
}

/**
 * Creates a new meal item record in the "Meals" table.
 * @param {CreateMealItem} mealData The data for the new meal item to be created.
 * @returns {Promise<MealItem>} A promise resolving to the newly created meal item record.
 */
async function createMealItem(mealData: CreateMealItem): Promise<MealItem> {
  try {
    // Convert mealData to a more generic type compatible with Airtable's expected input
    const airtableData: FieldSet = {
      name: mealData.name,
      runsheet: mealData.runsheet,
      date: mealData.date,
      ready: mealData.ready,
      recipeIds: mealData.recipeIds,
    };

    const createdRecords: Records<FieldSet> = await airtable("Meals").create([
      { fields: airtableData },
    ]);

    if (createdRecords && createdRecords.length > 0) {
      const record = createdRecords[0];
      const newMeal: MealItem = {
        id: record.id,
        name: record.fields.name as string,
        runsheet: record.fields.runsheet as string,
        date: record.fields.date as string,
        ready: record.fields.ready as boolean,
        recipeIds: record.fields.recipeIds as string[],
      };
      console.log(`Created new meal record ID: ${newMeal.id}`);
      return newMeal;
    } else {
      throw new Error("No records were created.");
    }
  } catch (error) {
    console.error("Failed to create the meal item:", error);
    throw error;
  }
}

/**
 * Fetches a single meal plan record from the "Meals" table by its ID.
 * @param mealPlanId The ID of the meal plan to fetch.
 * @returns A promise resolving to the meal plan record.
 */
async function getMealPlanById(
  mealPlanId: string
): Promise<MealPlanItem | null> {
  try {
    const record = await airtable("Meals").find(mealPlanId);
    if (!record) return null;

    // Assuming 'fields' is structured with the necessary details
    const mealPlan: MealPlanItem = {
      id: record.id,
      name: record.fields.name as string,
      runsheet: record.fields.runsheet as string,
      date: record.fields.date as string,
      ready: record.fields.ready as boolean,
      recipeIds: record.fields.recipeIds as string[],
      // Map other fields as necessary
    };
    return mealPlan;
  } catch (error) {
    console.error("Error fetching meal plan by ID:", error);
    return null; // Return null or throw, depending on how you want to handle errors
  }
}

// Export the function for use in other components
export { getMeals, updateMealItem, createMealItem, getMealPlanById };

export type { MealItem, UpdateMealItem, CreateMealItem };

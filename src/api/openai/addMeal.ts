import { openai } from "./OpenAi";
import { RecipeItem } from "../airtable/Recipe";
import {
  createMealItem,
  updateMealItem,
  getMealPlanById,
  MealItem,
} from "../airtable/Meal";

import { mergeShopping } from "./mergeShopping";
import { ShoppingItem } from "../airtable/Shopping";
import { createLog } from "../airtable/Log";

const shortRunSheet = {
  id: "recNN9OomyFTvYbap",
  fields: {
    name: "Meal plan name...",
    runsheet: `### Preparation
1. Preheat your oven to 175°C.
2. Grease and flour your cake pan.`,
  },
};

//
/**
 * Main function to generate a meal plan and update shopping items.
 * @param recipe JSON object representing a single recipe.
 * @param currentShoppingList JSON object representing the current shopping list.
 * @param useExistingMealPlan Boolean indicating whether to update an existing meal plan or create a new one.
 * @param existingMealPlanId Optional ID of an existing meal plan to update if useExistingMealPlan is true.
 */
/**
/**
 * Main function to generate a meal plan and update shopping items.
 */
async function processMealPlan(
  recipe: RecipeItem | null,
  useExistingMealPlan: boolean,
  existingMealPlanId: string | undefined,
  currentShoppingList: ShoppingItem[]
) {
  try {
    if (recipe === null) {
      throw new Error("Recipe is required to process the meal plan");
    }

    mergeShopping(currentShoppingList, recipe);

    if (useExistingMealPlan && existingMealPlanId) {
      const existingMealPlan: MealItem | null = await getMealPlanById(
        existingMealPlanId
      );

      // Check if the existing meal plan was fetched successfully
      if (existingMealPlan && existingMealPlan.runsheet) {
        const runsheetCompletion = await updateRunsheet(
          recipe,
          existingMealPlan.runsheet
        );

        if (runsheetCompletion && runsheetCompletion.content) {
          const runsheetData = JSON.parse(runsheetCompletion.content); // Parse the JSON content to get the meal item data
          // Update the existing meal plan
          await updateMealItem({
            id: existingMealPlanId,
            fields: {
              runsheet: runsheetData.fields.runsheet,
              name: runsheetData.fields.name,
            },
          });
        }
      } else {
        console.log(
          "Existing meal plan not found or runsheet is unavailable. Creating a new one."
        );

        const runsheetCompletion = await generateFreshRunsheet(recipe);

        if (runsheetCompletion && runsheetCompletion.content) {
          const runsheetData = JSON.parse(runsheetCompletion.content); // Parse the JSON content to get the meal item data

          await createMealItem({
            name: recipe.name,
            runsheet: runsheetData.fields.runsheet,
            ready: false,
          });
        }
      }
    } else {
      // Create a new meal plan item with the generated runsheet

      const runsheetCompletion = await generateFreshRunsheet(recipe);

      if (runsheetCompletion && runsheetCompletion.content) {
        const runsheetData = JSON.parse(runsheetCompletion.content); // Parse the JSON content to get the meal item data

        await createMealItem({
          name: recipe.name,
          runsheet: runsheetData.fields.runsheet,
          ready: false,
        });
      }
    }
  } catch (error) {
    console.error("Failed to process meal plan:", error);
    if (error instanceof SyntaxError) {
      console.error(
        "There was an error parsing the runsheet JSON:",
        error.message
      );
    }
  }
}

/**
 * Simulates an API call to generate a runsheet based on a recipe and shopping list.
 * This is an asynchronous function that fetches data from a chat-based AI model.
 */
async function updateRunsheet(recipe: RecipeItem, existingRunSheet: string) {
  console.log("existingRunSheet", existingRunSheet);

  const content = ` Here is the existing runsheet  /// : ${existingRunSheet} /// . Please merge this recipe into the existing runsheet above : ${JSON.stringify(
    recipe
  )}`;

  const response = await openai.chat.completions.create({
    model: process.env.REACT_APP_OPENAI_MODEL as string,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert chef that prepares a runsheet that involves multiple recipes for a meal. We are going to create a runsheet in markdown that helps us plan how we cook.

First, we need to assist the cook with gathering all the ingredients. Group them by the following categories, the fridge, the freezer, the pantry, the spice rack, the grocer. Use a emjoi for each recipe to help flag which recipe they belong too. You can omit categories if they're not relevant. 

Next mention any special equipment required for each recipe.

Next callout any special preparation that needs to be done ahead of time. You can use an Alert component for this.

  <Alert status='warning'>
    <AlertIcon />
    Don't forget to marinate the meat the day before.
  </Alert>

Finally can you make a table titled "method" with a recipe in each column, and a row for each logical grouping of the recipe method and type of prep. Ensure the detail from the orginal recipe comes across in this table.
        You response must be a JSON object. What follows is the schema for the object you should return.

         ${JSON.stringify(shortRunSheet)}

        The name property should include the new recipe and any existing recipes already listed in the runsheet details.
                `,
      },
      {
        role: "user",
        content: content,
      },
    ],
  });

  createLog({
    action: "updateRunSheet",
    response: response,
    modelType: "text",
  });

  return response.choices[0].message; // Assuming the structure contains a 'message' with 'content'
}

async function generateFreshRunsheet(recipe: RecipeItem) {
  const response = await openai.chat.completions.create({
    model: process.env.REACT_APP_OPENAI_MODEL as string,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
        You are an expert chef that prepares a runsheet for a meal. We are going to create a runsheet in markdown that helps us plan how we cook.

First, we need to assist the cook with gathering all the ingredients. Group them by the following categories, the fridge, the freezer, the pantry, the spice rack, the grocer. Use a emjoi for each recipe to help flag which recipe they belong too. You can omit categories if they're not relevant. 

Next mention any special equipment required for each recipe.

Next callout any special preparation that needs to be done ahead of time. You can use an Alert component for this.

  <Alert status='warning'>
    <AlertIcon />
    Don't forget to marinate the meat the day before.
  </Alert>

Finally can you make a table titled "method" with a recipe in each column, and a row for each logical grouping of the recipe method and type of prep. Ensure the detail from the orginal recipe comes across in this table.
        You response must be a JSON object. What follows is the schema for the object you should return.

         ${JSON.stringify(shortRunSheet)}

        The name property should include the new recipe and any existing recipes already listed in the runsheet details.
                `,
      },
      {
        role: "user",
        content: `Please make a runsheet for this recipe : ${JSON.stringify(
          recipe
        )}`,
      },
    ],
  });

  createLog({
    action: "newRunSheet",
    response: response,
    modelType: "text",
  });

  return response.choices[0].message; // Assuming the structure contains a 'message' with 'content'
}

export { processMealPlan };

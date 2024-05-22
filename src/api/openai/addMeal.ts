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
    name: "Classic Vanilla Cake",
    runsheet: `### Preparation
1. Preheat your oven to 350°F (175°C).
2. Grease and flour your cake pan.

### Special
- Mixing bowl
- Cake pan (9-inch round)
- Electric mixer

### Ingredients
- 2 cups all-purpose flour
- 1 cup sugar
- 1/2 cup butter, softened 
- 1 cup milk
- 2 teaspoons baking powder 
- 1 teaspoon vanilla extract 
- 2 eggs

### Running Time

| Time | Task                                   |
|------|------------------------------------------|
| 0 min| Cream butter and sugar                   |
| 10 min| Beat in eggs and vanilla                |
| 15 min| Mix in flour and baking powder alternately with milk |
| 25 min| Pour batter into pan and smooth top     |
| 30 min| Bake in preheated oven                  |
| 60 min| Remove from oven and cool               |
          `,
  },
};

const runSheet = {
  id: "recNN9OomyFTvYbap",
  fields: {
    name: "Creamy Tomato Soup and Classic Vanilla Cake",
    runsheet: `### Preparation
1. 🅰 ️Preheat your oven to 350°F (175°C).
2. 🅰 Grease and flour your cake pan.
1. 🅱 ️Prepare all ingredients: Chop onions and garlic, measure out tomato juice and cream.
2. 🅱 Preheat your large pot on the stove.

### Special Equipment
- 🅰 Large pot
- 🅰 Blender or immersion blender
- 🅱 Mixing bowl
- 🅱 Cake pan (9-inch round)
- 🅱 Electric mixer

### Ingredients
- 2 cups all-purpose flour
- 1 cup sugar
- 1/2 cup butter, softened 
- 1 cup milk
- 2 teaspoons baking powder 
- 1 teaspoon vanilla extract 
- 2 eggs

### Running Time

| Time | 🅰 Task                                      |
|------|-------------------------------------------|
| 0 min| Start sautéing onions and garlic          |
| 5 min| Add tomato juice and bring to a boil      |
| 20 min| Simmer and add salt and pepper           |


| Time | 🅱 Task                                     |
|------|------------------------------------------|
| 0 min| Cream butter and sugar                   |
| 10 min| Beat in eggs and vanilla                |
| 15 min| Mix in flour and baking powder alternately with milk |
| 25 min| Pour batter into pan and smooth top     |
| 30 min| Bake in preheated oven                  |

| Time | 🅰 Task                                |
|------|------------------------------------------|
| 25 min| Blend the soup until smooth              |
| 30 min| Stir in heavy cream and heat through     |
| 35 min| Serve garnished with basil               |

| Time | 🅱 Task                                     |
|------|------------------------------------------|
| 60 min| Remove from oven and cool               |
          `,
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
        content: `
        You are a helpful cooking assistant, writing a plan to help prepare multiple recipes.

        You will receive an existing plan that references a recipe, and all it's preparation steps and ingredients.
        
        Provide an updated plan for the cooking session which now factors in our new recipe.

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
        You are a helpful cooking assistant, writing a plan to help prepare multiple recipes.

        You response must be a JSON object. What follows is an example of how to style your runsheet response with Markdown, and the properties of the JSON response. The content should not be included in your response as it's not marked as the existing runsheet.

Please note this example shows the outputs from how two recipes, Creamy Tomato Soup and Classic Vanilla Cake were combined into a single runsheet. 

               RUNSHEET EXAMPLE ${JSON.stringify(runSheet)}`,
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

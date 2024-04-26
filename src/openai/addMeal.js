import { openai } from "./OpenAi";
import { airtable } from "../airtable/Airtable";
import {
  createMealItem,
  updateMealItem,
  getMealPlanById,
} from "../airtable/Meal";
import { addShoppingItem, updateShoppingItem } from "../airtable/Shopping";
import { addIngredientsToList } from "./addIngredients";

const runSheet = {
  id: "recNN9OomyFTvYbap",
  fields: {
    runsheet: `# Cooking Run sheet

## Soup Recipe: Creamy Tomato Soup

### Ingredients Checklist
- [ ] 4 cups of tomato juice (✔️ Purchased | ❌ Substitution: blend 6 ripe tomatoes with 1 cup water)
- [ ] 1 onion, finely chopped (✔️ Purchased | ❌ Substitution: 1 tablespoon onion powder)
- [ ] 2 cloves garlic, minced (✔️ Purchased | ❌ Substitution: 1 teaspoon garlic powder)
- [ ] 1 cup heavy cream (✔️ Purchased | ❌ Substitution: 1 cup coconut milk)
- [ ] Salt and pepper to taste (✔️ Purchased)
- [ ] Fresh basil for garnish (✔️ Purchased | ❌ Substitution: dried basil)

### Special Equipment
- Large pot
- Blender or immersion blender

### Preparation Steps
1. Prepare all ingredients: Chop onions and garlic, measure out tomato juice and cream.
2. Preheat your large pot on the stove.

### Streamlined Method with Running Time

| Time | Task                                      |
|------|-------------------------------------------|
| 0 min| Start sautéing onions and garlic          |
| 5 min| Add tomato juice and bring to a boil      |
| 20 min| Simmer and add salt and pepper           |
| 25 min| Blend the soup until smooth              |
| 30 min| Stir in heavy cream and heat through     |
| 35 min| Serve garnished with basil               |

## Cake Recipe: Classic Vanilla Cake

### Ingredients Checklist
- [ ] 2 cups all-purpose flour (✔️ Purchased | ❌ Substitution: 2 cups cake flour)
- [ ] 1 cup sugar (✔️ Purchased | ❌ Substitution: 1 cup honey)
- [ ] 1/2 cup butter, softened (✔️ Purchased | ❌ Substitution: 1/2 cup applesauce)
- [ ] 1 cup milk (✔️ Purchased | ❌ Substitution: 1 cup almond milk)
- [ ] 2 teaspoons baking powder (✔️ Purchased)
- [ ] 1 teaspoon vanilla extract (✔️ Purchased)
- [ ] 2 eggs (✔️ Purchased | ❌ Substitution: 2 flax eggs)

### Special Equipment
- Mixing bowl
- Cake pan (9-inch round)
- Electric mixer

### Preparation Steps
1. Preheat your oven to 350°F (175°C).
2. Grease and flour your cake pan.

### Streamlined Method with Running Time

| Time | Task                                     |
|------|------------------------------------------|
| 0 min| Cream butter and sugar                   |
| 10 min| Beat in eggs and vanilla                |
| 15 min| Mix in flour and baking powder alternately with milk |
| 25 min| Pour batter into pan and smooth top     |
| 30 min| Bake in preheated oven                  |
| 60 min| Remove from oven and cool               |
,
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
  recipe,
  currentShoppingList,
  useExistingMealPlan,
  existingMealPlanId
) {
  try {
    // Assuming generateRunsheet sends back a chat completion object that includes content field containing JSON string
    const runsheetCompletion = await generateRunsheet(
      recipe,
      currentShoppingList
    );
    const runsheetData = JSON.parse(runsheetCompletion.content); // Parse the JSON content to get the meal item data

    console.log("Generated Runsheet Data:", runsheetData);

    if (useExistingMealPlan && existingMealPlanId) {
      const existingMealPlan = await getMealPlanById(existingMealPlanId);

      // Check if the existing meal plan was fetched successfully
      if (existingMealPlan && existingMealPlan.fields) {
        const updatedRunsheet = `${existingMealPlan.fields.runsheet}\n\n---\n\n${runsheetData.fields.runsheet}`;
        // Update the existing meal plan
        await updateMealItem({
          id: existingMealPlanId,
          fields: { runsheet: updatedRunsheet.fields },
        });
      } else {
        console.log(
          "Existing meal plan not found or runsheet is unavailable. Creating a new one."
        );
        await createMealItem({
          name: recipe.name,
          runsheet: runsheetData.fields.runsheet,
        });
      }
    } else {
      // Create a new meal plan item with the generated runsheet
      await createMealItem({
        name: recipe.name,
        runsheet: runsheetData.fields.runsheet,
      });
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
async function generateRunsheet(recipe, shoppingList) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Create a runsheet for a cooking session based on the provided recipe and shopping list.
                Recipe: ${JSON.stringify(recipe)}
                Shopping List: ${JSON.stringify(shoppingList)}
                You response must be a JSON object that looks like the below.

                ${JSON.stringify(runSheet)}
                `,
      },
      {
        role: "user",
        content: `Please generate the runsheet.`,
      },
    ],
  });

  return response.choices[0].message; // Assuming the structure contains a 'message' with 'content'
}

export { processMealPlan };

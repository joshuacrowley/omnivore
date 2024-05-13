import { openai } from "./OpenAi";
import { addRecipe as addRecipeToAirtable } from "../airtable/Recipe";
import { KitchenContextType } from "../../KitchenContext";

// Function to create a prompt to send to the OpenAI API
async function addRecipe(prompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },

    messages: [
      {
        role: "system",
        content: `Here's an idea for a recipe.
                ${prompt}

                Can you make a json object we can use for the recipe.
                Note how the fields ingredients and method use markdown.
                
                Remember the fields are name, ingredients, method and serves.

                      {"name": "Chocolate Brownies",
      "ingredients": "- Butter | 2 sticks | Softened - Brown Sugar | 1 cup | - Sugar | 1/2 cup white | \n",
      "method": "Mix together dry ingredients with wet ingredients slowly. - Chocolate Chips | 1 Cup | > Usually I add 2 cups...just because. Stir in ~1 cup or more of...",
      "serves": 4}

      Or by the way I can't have dairy, can you substitute?
      
      Can convert to metric 

      name, not Title or Recipe title. It must be name.
                `,
      },
    ],
  });

  console.log(response.choices[0]);

  return response.choices[0];
}

type RunChefRecipeParams = Pick<
  KitchenContextType,
  "setSelectedRecipe" | "fetchRecipes"
>;

// Main function to process the text prompt and update Airtable
async function runRecipe(
  prompt: string,
  { setSelectedRecipe, fetchRecipes }: RunChefRecipeParams
) {
  try {
    // Fetch the recipe data from OpenAI
    const openaiResponse = await addRecipe(prompt);

    if (openaiResponse.message.content === null) {
      throw new Error("Received null content from OpenAI response");
    }

    // Assuming OpenAI response is in openaiResponse.message.content and is a JSON string
    // Directly parsing the message content to form the fields object for Airtable
    const recipeData = JSON.parse(openaiResponse.message.content);

    // Insert the parsed data into Airtable
    const recipe = await addRecipeToAirtable(recipeData);

    // Set the newly created recipe ID as the selectedRecipeId if needed
    if (recipe) {
      await fetchRecipes(); // Refresh the recipes list
      setSelectedRecipe({ ...recipe }); // Update the selected recipe

      console.log("New recipe added:", recipe);
    }
  } catch (error) {
    console.error("Failed to process and upload the recipe:", error);
    throw error; // Re-throw or handle as needed for UI feedback
  }
}

export { runRecipe };

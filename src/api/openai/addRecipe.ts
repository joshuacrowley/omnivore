import { openai } from "./OpenAi";
import { addRecipe as addRecipeToAirtable } from "../airtable/Recipe";
import { createLog } from "../airtable/Log";
import { KitchenContextType } from "../../KitchenContext";

// Function to create a prompt to send to the OpenAI API
async function addRecipe(prompt: string) {
  const response = await openai.chat.completions.create({
    model: process.env.REACT_APP_OPENAI_MODEL as string,
    response_format: { type: "json_object" },

    messages: [
      {
        role: "system",
        content: `Here's an idea for a recipe.
                ${prompt}

                Can you make a json object we can use for the recipe.
                Note how the fields ingredients and method use MDX which is React + Markdown. Remember the fields are name, ingredients, method and serves.

                I use the metric system, so please disregard temperatures in °F. So "350°F (175°C)" would become "175°C".

                I'm dairy intolerant. If you see an ingredient I can't eat like  Butter or Milk can you add them to the query array. Here's a full example.
                      
                { "name": "Chocolate Brownies",
      "ingredients": " 
      - 2 sticks of **Butter**
      - 1 cup of **Milk**
      - 1 cup of **Brown Sugar**
      - 1/2 cup of  **White sugar**
      ",
      "method": " 1. Mix together dry ingredients with wet ingredients slowly. 2. Stir in 1 cup or more of **brown sugar**...",
      "serves": 4}
                `,
      },
    ],
  });

  console.log(response.choices[0]);

  createLog({
    action: "addRecipeViaText",
    response: response,
    modelType: "text",
  });

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

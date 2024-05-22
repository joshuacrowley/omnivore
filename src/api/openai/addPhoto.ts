import { openai } from "./OpenAi";
import { addRecipe as addRecipeToAirtable } from "../airtable/Recipe";
import { KitchenContextType } from "../../KitchenContext";
import { createLog } from "../airtable/Log";

// Function to create a prompt to send to the OpenAI API
async function addRecipe(base64Image: string) {
  const response = await openai.chat.completions.create({
    model: process.env.REACT_APP_OPENAI_MODEL as string,
    response_format: { type: "json_object" },

    messages: [
      {
        role: "system",
        content: `You are a helpful assistant. Analyze the contents of the image of a cookbook page and describe the text found within it in structured JSON format.
     
Remember the fields are name, ingredients, method and serves.



                         {"name": "Chocolate Brownies",
      "ingredients": "- Butter | 2 sticks| Softened\n
       - Brown Sugar | 1 cup \n
        - Sugar | 1/2 cup white \n",
      "method": "1. Mix together dry ingredients with wet ingredients slowly. - Chocolate Chips | 1 Cup | > Usually I add 2 cups...just because. Stir in ~1 cup or more of...",
      "serves": 4}

      Name, not Title or Recipe title. It must be name. serves is a number, not a string .e.g 4 not "4"

      I can't have dairy, can you substitute for a diary free ingredient instead?
      Can you always use metric measurements.

      
      Note how the fields ingredients and method use markdown.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image of a recipe and return a JSON output.",
          },
          {
            type: "image_url",
            image_url: {
              url: `${base64Image}`,
            },
          },
        ],
      },
    ],
  });

  console.log(response.choices[0]);

  createLog({
    action: "addRecipeViaPhoto",
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
  base64Image: string,
  { setSelectedRecipe, fetchRecipes }: RunChefRecipeParams
) {
  try {
    // Fetch the recipe data from OpenAI
    const openaiResponse = await addRecipe(base64Image);

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

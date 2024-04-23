import { openai } from "./OpenAi";
import { airtable } from "../airtable/Airtable";

// Function to create a prompt to send to the OpenAI API
async function addRecipe(prompt) {
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

      name, not Title or Recipe title. It must be name.
                `,
      },
    ],
  });

  console.log(response.choices[0]);

  return response.choices[0];
}

// Function to map and insert data to Airtable
async function insertToAirtable(fields) {
  // Promisify the Airtable create function
  return new Promise((resolve, reject) => {
    airtable("Recipes").create([{ fields }], function (err, records) {
      if (err) {
        reject(err);
        return;
      }
      resolve(records);
    });
  });
}

// Main function to process the text prompt and update Airtable
async function runRecipe(prompt, { setSelectedRecipe, fetchRecipes }) {
  try {
    // Fetch the recipe data from OpenAI
    const openaiResponse = await addRecipe(prompt);

    // Assuming OpenAI response is in openaiResponse.message.content and is a JSON string
    // Directly parsing the message content to form the fields object for Airtable
    const recipeData = JSON.parse(openaiResponse.message.content);

    // Insert the parsed data into Airtable
    const records = await insertToAirtable(recipeData);

    // Set the newly created recipe ID as the selectedRecipeId if needed
    if (records.length > 0) {
      await fetchRecipes(); // Refresh the recipes list
      setSelectedRecipe({ ...records[0].fields, id: records[0].id }); // Update the selected recipe

      console.log("New recipe added:", records[0]);
    }
  } catch (error) {
    console.error("Failed to process and upload the recipe:", error);
    throw error; // Re-throw or handle as needed for UI feedback
  }
}

export { runRecipe };

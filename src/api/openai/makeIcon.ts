import { openai } from "./OpenAi";
import { updateRecipes, RecipeItem } from "../airtable/Recipe";
import { createLog } from "../airtable/Log";

// Function to generate images based on the key ingredient of a recipe
async function generateImagesForKeyIngredient(
  recipe: RecipeItem
): Promise<string[]> {
  let imageUrls: string[] = [];
  const prompt = `Decide the key ingredient most related to the recipe name, then create a screen print style image in black and white of that ingredient. Please do not include any text, and try and make the background plain white. Recipe details: ${recipe.name}, Ingredients: ${recipe.ingredients}`;

  for (let i = 0; i < 1; i++) {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    createLog({ action: "createIcon", modelType: "image" });

    if (response.data[0].url) {
      console.log("photo url", response.data[0].url);
      imageUrls.push(response.data[0].url);
    } else {
      console.error("No URL returned from OpenAI API");
      // Optionally, handle this scenario appropriately, perhaps by breaking the loop or setting a default image.
    }
  }

  return imageUrls;
}

// Function to update a recipe in Airtable with generated images
async function updateRecipeWithImages(
  recipeId: string,
  imageUrls: string[]
): Promise<void> {
  const updateData = {
    id: recipeId,
    fields: {
      photo: imageUrls.map((url) => ({ url })),
    },
  };

  try {
    console.log(
      "Sending data to Airtable:",
      JSON.stringify(updateData, null, 2)
    );
    //@ts-ignore
    const updatedRecipes = await updateRecipes([updateData]);
    console.log("Updated recipes with new images:", updatedRecipes);
  } catch (error) {
    console.error("Error updating recipes with images:", error);
  }
}

// Main function to handle the image generation and updating process
async function handleRecipeImageUpdate(recipe: RecipeItem): Promise<void> {
  try {
    // Generate images based on the recipe's key ingredient
    const imageUrls = await generateImagesForKeyIngredient(recipe);

    // Update the recipe record in Airtable with the generated images
    await updateRecipeWithImages(recipe.id, imageUrls);

    console.log("Recipe updated successfully with images.");
  } catch (error) {
    console.error("Failed to update recipe with images:", error);
  }
}

export { handleRecipeImageUpdate };

//@ts-nocheck
import { airtable } from "../airtable/Airtable";
import { openai } from "./OpenAi";
import { ShoppingItem } from "../airtable/Shopping";
import { RecipeItem } from "../airtable/Recipe";

// Function to create a prompt to send to the OpenAI API
async function createPrompt(shopping: ShoppingItem[], recipe: RecipeItem) {
  const response = await openai.chat.completions.create({
    model: process.env.REACT_APP_OPENAI_MODEL as string,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant.
        
        Here's the existing shopping list, please use this as a reference when adding, updating or removing items from the shopping list:
        
        ${JSON.stringify(shopping)}        
        
        Here's the properties of an ingredient, as shown in this JSON - note the fields object.
     
        {   "id": "recCTJJwdWaN76tbk",
            fields: {
                item: "Brown onion",
                quantity: "1",
                category: "Fruits and Vegetables",
                bought: true,
            }
        },

    The field names are item, quantity, category and bought. They're not interchangeable, and must be adhered too. Don't use alternate field names.

    Please provide an object back with the following optional properties
         ingredientsToAdd, which has an array of new ingredients
         ingredientsToUpdate, which has an array of existing ingredients in a new state, with an id property. For example if an ingredient is already on the list with an existing quantity, you can add the required amount and update the quantity 100g -> 200g 
         ingredientsToRemove, which has an array of ingredient ids
    
    If you can use ingredientsToUpdate, use that, before you use ingredientsToAdd.

    Use ingredientsToRemove to remove any ingredients not in the recipe.

    A valid response, would look like this:

    {
        ingredientsToUpdate: [{
            "id": "recCTJJwdWaN76tbk",
            "fields": {
                "item": "Crème fraîche",
                "quantity": "100 g",
                "category": "Dairy",
                "bought": true,
                "recipeIds" : ['recCTJJwdWaN76tbk', 'recCTJJwdWaN76abc']
            }
        },
    
            "id": "recCTJJwdWaN76tbk",
            "fields": {
                "bought": false,
            }
        }
    ],
        "ingredientsToAdd": [
        {
            "fields": {
                "item": "Brown onion",
                "quantity": "1",
                "category": "Fruits and Vegetables",
                "bought": true,
                "recipeIds" : ['recCTJJwdWaN76tbk', 'recCTJJwdWaN76abc']
            }
        },
        {
            fields: {
                item: "Olive oil, extra-virgin",
                quantity: "1½ tbsp",
                category: "Pantry Essentials",
                bought: true,
                "recipeIds" : ['recCTJJwdWaN76tbk']
            }
        },
        ],
        "ingredientsToRemove": ["recCTJJwdWaN76tbk","recCTJJwdWaN76tbk"]
    }

    or an empty array, if there are no ingredients to add.

    {
        ingredientsToAdd: [],
        ingredientsToRemove : [],
        ingredientsToUpdate : []
    }

  

    `,
      },
      {
        role: "user",
        content: [
          {
            type: "text",

            text: `Here's a recipe and a list of ingredients I'd like to prepare - please review the list
            
            ${recipe.name} - ${recipe.id}

            Ingredients:
            ${JSON.stringify(recipe.ingredients)}`,
          },

          {
            type: "text",
            text: "Create a JSON array of ALL the ingredients I need to add, update or remove from the shopping list from this recipe.",
          },
        ],
      },
    ],
  });

  console.log(response.choices[0]);

  return response.choices[0];
}

function processAirtableBatch(operation: string, records, doneCallback) {
  // Split the records array into chunks of 10
  let recordChunks = [];
  for (let i = 0; i < records.length; i += 10) {
    recordChunks.push(records.slice(i, i + 10));
  }

  recordChunks.forEach((chunk) => {
    switch (operation) {
      case "create":
        airtable("Shopping").create(chunk, doneCallback);
        break;
      case "update":
        airtable("Shopping").update(chunk, doneCallback);
        break;
      case "destroy":
        airtable("Shopping").destroy(chunk, doneCallback);
        break;
      default:
        console.error("Unsupported operation");
    }
  });
}

function insertToAirtable(data) {
  const { ingredientsToUpdate, ingredientsToAdd, ingredientsToRemove } = data;

  // Update records
  if (ingredientsToUpdate && ingredientsToUpdate.length) {
    processAirtableBatch("update", ingredientsToUpdate, (err, records) => {
      if (err) {
        console.error("Update Error:", err);
        return;
      }
      records.forEach((record) => console.log("Updated:", record.getId()));
    });
  }

  // Create new records
  if (ingredientsToAdd && ingredientsToAdd.length) {
    processAirtableBatch("create", ingredientsToAdd, (err, records) => {
      if (err) {
        console.error("Create Error:", err);
        return;
      }
      records.forEach((record) => console.log("Created:", record.getId()));
    });
  }

  // Destroy records
  if (ingredientsToRemove && ingredientsToRemove.length) {
    processAirtableBatch(
      "destroy",
      ingredientsToRemove,
      (err, deletedRecords) => {
        if (err) {
          console.error("Destroy Error:", err);
          return;
        }
        console.log("Deleted:", deletedRecords.length, "records");
      }
    );
  }
}

// Main function to process the image and update Airtable
async function mergeShopping(shopping: ShoppingItem[], recipe: RecipeItem) {
  try {
    const openaiResponse = await createPrompt(shopping, recipe);

    console.log(JSON.parse(openaiResponse.message.content).ingredientsToAdd);

    insertToAirtable(JSON.parse(openaiResponse.message.content));
  } catch (error) {
    console.error(error);
  }
}

export { mergeShopping };

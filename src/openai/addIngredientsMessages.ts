import { openai } from "./OpenAi";
import { FieldSet, Record } from "airtable"; // Assuming you have airtable package installed
import { airtable } from "../airtable/Airtable";
import { ShoppingItem } from "../airtable/Shopping";

// Extend FieldSet to ensure compatibility with Airtable's requirements
interface ShoppingFields extends FieldSet {
  item: string;
  quantity: string;
  category: string;
  bought?: boolean;
  recipeIds?: string[];
  [key: string]: any; // Adding an index signature to satisfy FieldSet requirements
}

export interface ChatMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string | null; // Accept null as a possible type for content
    };
  }>;
}

// Ensure the Record type from Airtable is used correctly with the correct generic parameter
type AirtableShoppingRecord = Record<ShoppingFields>;

/**
 * Generates a shopping list by submitting messages to the OpenAI API.
 * @param conversationMessages - The accumulated conversation messages including user and AI responses.
 * @returns The AI response choice containing the generated shopping list and updated conversation.
 */
async function generateShoppingList(
  conversationMessages: ChatMessage[]
): Promise<ChatCompletionResponse> {
  // Define the system message
  const systemMessage: ChatMessage = {
    role: "system",
    content: `Based on the following description, generate a list of shopping items in a JSON object format.
              Note: Please format the response as a JSON object with a key "ingredientsToAdd" that contains an array of items.
              
              Example:
              {
                "ingredientsToAdd": [
                  {"item": "Eggs", "quantity": "12", "category": "Dairy"},
                  {"item": "Almond milk", "quantity": "1 litre", "category": "Beverages"}
                ]
              }`,
  };

  // Prepend the system message to ensure it's always the first message sent to the API
  const messages = [systemMessage, ...conversationMessages];

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: messages,
  });

  console.log(response.choices[0]);
  return response;
}

// The function to insert items into Airtable, correctly typing the 'fields' property
async function insertToShoppingTable(
  items: Array<{ fields: Omit<ShoppingItem, "id"> }>
): Promise<ShoppingItem[]> {
  return new Promise((resolve, reject) => {
    airtable("Shopping").create(
      //@ts-ignore
      items,
      (err, records: AirtableShoppingRecord[] | undefined) => {
        if (err) {
          reject(err);
          return;
        }
        if (!records) {
          reject(new Error("No records returned from Airtable"));
          return;
        }
        resolve(
          records.map((record) => ({
            id: record.id,
            item: String(record.fields.item),
            quantity: String(record.fields.quantity),
            category: String(record.fields.category),
            bought: Boolean(record.fields.bought),
            recipeIds: record.fields.recipeIds as string[], // Ensure type casting is correct
          }))
        );
      }
    );
  });
}

// Main function to process the text prompt and update Airtable

async function addIngredientsToList(
  conversationMessages: ChatMessage[]
): Promise<ShoppingItem[]> {
  try {
    // Generate shopping list items from the prompt
    const openaiResponse = await generateShoppingList(conversationMessages);

    console.log(openaiResponse);

    if (
      !openaiResponse.choices.length ||
      !openaiResponse.choices[0].message.content
    ) {
      throw new Error("No content received from OpenAI or content is null");
    }
    const jsonResponse = JSON.parse(
      openaiResponse.choices[0].message.content || "{}"
    );

    const shoppingItems = jsonResponse.ingredientsToAdd as ShoppingItem[];

    const itemsToInsert = shoppingItems.map((item) => ({ fields: item }));
    const records = await insertToShoppingTable(itemsToInsert);

    console.log("New items added to shopping list:", records.length);
    return records; // Ensure you return the correct data
  } catch (error) {
    console.error("Failed to process and upload shopping items:", error);
    throw error; // Re-throw to allow for error handling elsewhere
  }
}

export { addIngredientsToList, generateShoppingList, insertToShoppingTable };

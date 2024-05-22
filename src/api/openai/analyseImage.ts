import { openai } from "../openai/OpenAi";
import { ShoppingItem } from "../airtable/Shopping";
import { createLog } from "../airtable/Log";

/**
 * Filters out items that are marked as bought and returns an array
 * of objects containing only the id and item properties to reduce tokens.
 *
 * @param {Array} items - The array of item objects to be filtered and transformed.
 * @returns {Array} - An array of objects with id and item properties.
 */
function filterItems(items: ShoppingItem[]) {
  return items
    .filter((item) => !item.bought)
    .map(({ id, item }) => ({ id, item }));
}

const analyseImage = async (
  base64Image: string,
  shoppingList: ShoppingItem[]
): Promise<string[] | null> => {
  console.log("Sending image to OpenAI API");

  const messages: {
    role: string;
    content:
      | string
      | {
          type: string;
          text?: string;
          image_url?: { url: string; detail: string };
        }[];
  }[] = [
    {
      role: "system",
      content: `You are a helpful assistant, ticking grocery items off a shopping list as you see them. Here's the current shopping list: ${JSON.stringify(
        filterItems(shoppingList)
      )}. As you detect each item, tick them off the shopping list, but only do it once.`,
    },
    {
      role: "user",
      content: [
        { type: "text", text: "What’s in this image?" },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${base64Image}`,
            detail: "low",
          },
        },
      ],
    },
  ];

  const tools = [
    {
      type: "function",
      function: {
        name: "tickOffShoppingList",
        description: "Tick off detected grocery items from the shopping list",
        parameters: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { type: "string" },
              description: "The ids of the grocery items detected in the image",
            },
          },
          required: ["items"],
        },
      },
    },
  ];

  const detectedItems = new Set<string>();

  const tickOffShoppingList = (items: string[]): string[] | null => {
    const detectedIds: string[] = [];
    items.forEach((item) => {
      const shoppingItem = shoppingList.find((i) => i.id === item);
      if (shoppingItem && !detectedItems.has(shoppingItem.id)) {
        detectedItems.add(shoppingItem.id);
        detectedIds.push(shoppingItem.id);
      }
    });
    return detectedIds.length > 0 ? detectedIds : null;
  };

  //@ts-ignore
  const response = await openai.chat.completions.create({
    model: process.env.REACT_APP_OPENAI_MODEL as string,
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  console.log("Received response from OpenAI API");
  const responseMessage = response.choices[0].message;

  createLog({
    action: "analyseImage",
    response: response,
    modelType: "text",
  });

  const toolCalls = responseMessage.tool_calls;

  if (toolCalls) {
    const availableFunctions: {
      [key: string]: (items: string[]) => string[] | null;
    } = {
      tickOffShoppingList: tickOffShoppingList,
    };

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];

      if (typeof functionToCall === "function") {
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionResponse = functionToCall(functionArgs.items);

        if (functionResponse && functionResponse.length > 0) {
          console.log(
            `Detected and ticked off item IDs: ${functionResponse.join(", ")}`
          );
          return functionResponse;
        }
      } else {
        console.error(`Function ${functionName} is not a valid function`);
      }
    }
  } else {
    console.log(`Nothing detected.`);
  }
  return null;
};

export { analyseImage };

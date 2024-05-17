import { openai } from "../openai/OpenAi";
import { ShoppingItem } from "../airtable/Shopping";

const analyseImage = async (
  base64Image: string,
  shoppingList: ShoppingItem[]
): Promise<string | null> => {
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
        shoppingList
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
            item: {
              type: "string",
              description: "The id of the grocery item detected in the image",
            },
          },
          required: ["item"],
        },
      },
    },
  ];

  const detectedItems = new Set<string>();

  const tickOffShoppingList = (item: string): string | null => {
    const shoppingItem = shoppingList.find((i) => i.id === item);
    if (shoppingItem && !detectedItems.has(shoppingItem.id)) {
      detectedItems.add(shoppingItem.id);
      return shoppingItem.id;
    }
    return null;
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
  const toolCalls = responseMessage.tool_calls;

  if (toolCalls) {
    const availableFunctions: {
      [key: string]: (item: string) => string | null;
    } = {
      tickOffShoppingList: tickOffShoppingList,
    };

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];

      if (typeof functionToCall === "function") {
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionResponse = functionToCall(functionArgs.item);

        if (functionResponse) {
          console.log(`Detected and ticked off item ID: ${functionResponse}`);
          return functionResponse;
        }
      } else {
        console.error(`Function ${functionName} is not a valid function`);
      }
    }
  }
  return null;
};

export { analyseImage };

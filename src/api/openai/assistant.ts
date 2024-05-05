import { openai } from "./OpenAi";

async function updatedAssistant(assistant_id: string) {
  try {
    const myUpdatedAssistant = await openai.beta.assistants.update(
      assistant_id,
      {
        instructions:
          "You are a helpful assistant that helps manage recipes, access and maintain shopping lists and meal plans.",
        name: "Chef CKJ",
        tools: [
          { type: "file_search" },
          {
            type: "function",
            function: {
              name: "add_recipe",
              description: "Provide a detailed idea for a recipe",
              parameters: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description: "A detailed idea for a recipe",
                  },
                },
                required: ["prompt"],
              },
            },
          },
        ],
        model: "gpt-4-turbo",
      }
    );
    console.log("Assistant updated successfully:", myUpdatedAssistant);
    return myUpdatedAssistant;
  } catch (error) {
    console.error("Failed to update assistant:", error);
    throw error; // Re-throw to handle the error further up the call stack if necessary
  }
}

// const functionCallHandler = async (call) => {
//   if (call?.function?.name !== "get_weather") return;
//   const args = JSON.parse(call.function.arguments);
//   const data = getWeather(args.location);
//   setWeatherData(data);
//   return JSON.stringify(data);
// };

export { updatedAssistant };

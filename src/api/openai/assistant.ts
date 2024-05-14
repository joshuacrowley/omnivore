import { openai } from "./OpenAi";

const getOrCreateVectorStore = async (assistant_id: string) => {
  const assistant = await openai.beta.assistants.retrieve(assistant_id);

  // if the assistant already has a vector store, return it
  //@ts-ignore
  if (assistant.tool_resources?.file_search?.vector_store_ids?.length > 0) {
    //@ts-ignore
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }
  // otherwise, create a new vector store and attatch it to the assistant
  const vectorStore = await openai.beta.vectorStores.create({
    name: "sample-assistant-vector-store",
  });
  await openai.beta.assistants.update(assistant_id, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });
  return vectorStore.id;
};

async function updatedAssistant(assistant_id: string) {
  try {
    const vectorStoreId = await getOrCreateVectorStore(assistant_id); // get or create vector store

    const myUpdatedAssistant = await openai.beta.assistants.update(
      assistant_id,
      {
        instructions:
          "You are a helpful assistant that helps recall details about recipes in your collection. You can add recipes to the collection, if asked to do so.",
        name: "Chef Omni",
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId],
          },
        },
        tools: [
          { type: "file_search" },

          {
            type: "function",
            function: {
              name: "add_recipe",
              description: "Add a detailed idea for a recipe",
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
        model: process.env.REACT_APP_OPENAI_MODEL as string,
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

export { updatedAssistant, getOrCreateVectorStore };

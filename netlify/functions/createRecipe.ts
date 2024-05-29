const Airtable = require("airtable");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const base = new Airtable({
  apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
}).base(process.env.REACT_APP_AIRTABLE_BASE);

const saveRecipeAsMarkdown = async (recipe) => {
  const date = new Date();
  const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}_${date
    .getHours()
    .toString()
    .padStart(2, "0")}-${date.getMinutes().toString().padStart(2, "0")}-${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;

  const filePath = path.join(
    "/tmp",
    `${recipe.name}-${recipe.id}-${timestamp}.md`
  );
  const content = `# ${recipe.name}\n\n${recipe.ingredients}\n\n${recipe.method}\n\n Serves: ${recipe.serves}`;
  fs.writeFileSync(filePath, content);
  return filePath;
};

const getOrCreateVectorStore = async () => {
  const assistant = await openai.beta.assistants.retrieve(
    process.env.REACT_APP_ASSISTANT_ID
  );
  if (assistant.tool_resources?.file_search?.vector_store_ids?.length > 0) {
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }
  const vectorStore = await openai.beta.vectorStores.create({
    name: "Recipes",
  });
  await openai.beta.assistants.update(process.env.REACT_APP_ASSISTANT_ID, {
    tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
  });
  return vectorStore.id;
};

const uploadAndAttachFile = async (filePath) => {
  const file = fs.createReadStream(filePath);
  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });
  const vectorStoreId = await getOrCreateVectorStore();
  await openai.beta.vectorStores.files.create(vectorStoreId, {
    file_id: openaiFile.id,
  });
  return openaiFile.id;
};

const updateRecipeRecord = async (recipeId, fileId) => {
  await base("Recipes").update([
    {
      id: recipeId,
      fields: {
        fileId: fileId,
      },
    },
  ]);
};

exports.handler = async (event, context) => {
  try {
    const recipe = JSON.parse(event.body);

    const filePath = await saveRecipeAsMarkdown(recipe);
    const fileId = await uploadAndAttachFile(filePath);
    await updateRecipeRecord(recipe.id, fileId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Recipe processed and uploaded.",
        fileId,
      }),
    };
  } catch (error) {
    console.error("Failed to process recipe:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to process recipe",
        error: error.message,
      }),
    };
  }
};

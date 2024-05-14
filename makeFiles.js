require("dotenv").config({ path: ".env.local" }); // Specify the path to your .env.local file

const Airtable = require("airtable");
const fs = require("fs");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env["REACT_APP_OPENAI_API_KEY"], // This is the default and can be omitted
});

const base = new Airtable({
  apiKey: process.env["REACT_APP_AIRTABLE_API_KEY"],
}).base(process.env["REACT_APP_AIRTABLE_BASE"]);

const getRecipes = async () => {
  const records = await base("Recipes").select().all();
  return records.map((record) => ({
    id: record.id,
    name: record.get("name"),
    ingredients: record.get("ingredients"),
    method: record.get("method"),
    serves: record.get("serves"),
  }));
};

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

const saveRecipeAsMarkdown = async (recipe) => {
  const filePath = `./recipes/${recipe.name}-${recipe.id}-${timestamp}.md`;
  const content = `# ${recipe.name}\n\n${recipe.ingredients}\n\n${recipe.method}\n\n Serves :${recipe.serves}`;
  fs.writeFileSync(filePath, content);
  return filePath;
};

const getOrCreateVectorStore = async () => {
  const assistant = await openai.beta.assistants.retrieve(
    process.env["REACT_APP_ASSISTANT_ID"]
  );
  if (assistant.tool_resources?.file_search?.vector_store_ids?.length > 0) {
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }
  const vectorStore = await openai.beta.vectorStores.create({
    name: "Recipes",
  });
  await openai.beta.assistants.update(process.env["REACT_APP_ASSISTANT_ID"], {
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
  return openaiFile.id; // Return the file ID
};

// Function to update the Airtable record with the file ID
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

const processRecipes = async () => {
  const recipes = await getRecipes();
  for (let recipe of recipes) {
    const filePath = await saveRecipeAsMarkdown(recipe);
    const fileId = await uploadAndAttachFile(filePath); // Get the file ID after uploading
    await updateRecipeRecord(recipe.id, fileId); // Update the Airtable record with the file ID
  }
};

processRecipes()
  .then(() => console.log("All recipes processed."))
  .catch((error) => console.error("Failed to process recipes:", error));

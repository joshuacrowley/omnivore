require("dotenv").config();
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

const saveRecipeAsMarkdown = async (recipe) => {
  const filePath = `./recipes/${recipe.id}.md`;
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
};

const processRecipes = async () => {
  const recipes = await getRecipes();
  for (let recipe of recipes) {
    const filePath = await saveRecipeAsMarkdown(recipe);
    //await uploadAndAttachFile(filePath);
  }
};

processRecipes()
  .then(() => console.log("All recipes processed."))
  .catch((error) => console.error("Failed to process recipes:", error));

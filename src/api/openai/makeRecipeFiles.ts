import { openai } from "./OpenAi";
import { airtable } from "../airtable/Airtable";
import { getRecipes } from "../airtable/Recipe";

async function main() {
    const assistant = await openai.beta.assistants.create({
        name: "Recipe Assistant",
        instructions:
            "You are an expert chef. Use you knowledge base to help a user select a recipe, or create a new recipe.",
        model: "gpt-4-turbo",
        tools: [{ type: "file_search" }],
    });

    const fetchedRecipes = await getRecipes();
    
}

  // async function getRecipes(
  //   filters?: Airtable.SelectOptions<Select>
  // ): Promise<RecipeItem[]> {
  //   const recordsList: RecipeItem[] = [];
  //   return new Promise((resolve, reject) => {
  //     airtable("Recipes")
  //       .select(
  //         filters || {
  //           maxRecords: 10,
  //         }
  //       )
  //       .eachPage(
  //         function page(records, fetchNextPage) {
  //           records.forEach(function (record) {
  //             recordsList.push({
  //               id: record.id,
  //               name: record.fields.name as string,
  //               ingredients: record.fields.ingredients as string,
  //               method: record.fields.method as string,
  //               serves: record.fields.serves as number,
  //               photo: record.fields.photo as Attachment[], // Optional, may not always be present
  //               recipeId: record.id, // Using the record's own ID for this field
  //               meals: record.fields.meals as string[],
  //               shopping: record.fields.shopping as string[],
  //             });
  //           });
  //           fetchNextPage();
  //         },
  //         function done(err) {
  //           if (err) {
  //             console.error(err);
  //             reject(err);
  //             return;
  //           }
  //           resolve(recordsList);
  //         }
  //       );
  //   });
  // }

  //Make markdown files for each recipe

  /*

  

*/

//   // Create a vector store including our two files.
//   let vectorStore = await openai.beta.vectorStores.create({
//     name: "Recipes",
//   });

//   const fileStreams = ["edgar/goog-10k.pdf", "edgar/brka-10k.txt"].map((path) =>
//     fs.createReadStream(path)
//   );

//   await openai.beta.vectorStores.fileBatches.uploadAndPoll(
//     vectorStore.id,
//     fileStreams
//   );

//   await openai.beta.assistants.update(assistant.id, {
//     tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
//   });
// }

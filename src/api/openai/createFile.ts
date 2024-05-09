import { openai } from "./OpenAi";
import { getOrCreateVectorStore } from "./assistant";
import { getShoppingRecords } from "../airtable/Shopping";

async function createMarkdownFile(recipeId: string, markdownContent: string) {
  // Convert markdown content into a blob
  const blob = new Blob([markdownContent], { type: "text/markdown" });

  // Upload the file to OpenAI (assuming using a serverless function or a secure method)
  const fileId = await uploadFile(blob, "assistants"); // Function to be defined as per the server's setup

  const vectorStoreId = await getOrCreateVectorStore(
    process.env.REACT_APP_ASSISTANT_ID as string
  ); // get or create vector store
  await attachFileToVectorStore(vectorStoreId, fileId); // Function to be defined as per OpenAI API

  // Update the Airtable record with the new fileId
  await updateRecipeWithFileId(recipeId, fileId);
}

// Function to attach a file to a vector store (simplified for conceptual use)
async function attachFileToVectorStore(vectorStoreId: string, fileId: string) {
  try {
    const response = await fetch(
      `https://api.openai.com/v1/vectorStores/${vectorStoreId}/files`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer YOUR_SECRET_API_KEY",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_id: fileId }),
      }
    );
    if (!response.ok) throw new Error("Failed to attach file to vector store");
    console.log("File attached to vector store successfully");
  } catch (error) {
    console.error("Error attaching file to vector store:", error);
    throw error;
  }
}

// Function to update an Airtable record
async function updateRecipeWithFileId(
  recipeId: string,
  fileId: string
): Promise<void> {
  const updateData = {
    id: recipeId,
    fields: {
      fileId: fileId,
    },
  };

  try {
    console.log(
      "Sending data to Airtable:",
      JSON.stringify(updateData, null, 2)
    );
    //@ts-ignore
    const updatedRecipes = await updateRecipes([updateData]);
    console.log("Updated recipes with new fileId:", updatedRecipes);
  } catch (error) {
    console.error("Error updating recipes with fileId:", error);
  }
}

async function uploadFile(blob: Blob, purpose: string) {
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("purpose", purpose);

  try {
    const response = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to upload file:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error during file upload:", error);
    return null;
  }
}

export { createMarkdownFile };

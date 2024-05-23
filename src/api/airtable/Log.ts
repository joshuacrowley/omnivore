import { airtable } from "./Airtable";
import { FieldSet, Records } from "airtable";

interface CreateLog {
  action: string;
  response?: {
    usage?: {
      total_tokens?: number;
      prompt_tokens?: number;
      completion_tokens?: number;
    };
    choices?: { message?: { content: string | null } }[];
  };
  modelType: "text to speech" | "speech to text" | "image" | "text" | "vision";
  cost?: number;
  characters?: number;
}

function calculateCost(logData: CreateLog): number {
  const { modelType, response, characters } = logData;
  let cost = 0;

  switch (modelType) {
    case "text to speech":
      cost = cost = ((characters || 0) / 1_000_000) * 15.0;
      break;
    case "speech to text":
      // Assuming `response.usage.total_tokens` represents minutes for this example.
      cost = (characters || 0) * 0.006;
      break;
    case "image":
      cost = 0.04;
      break;
    case "text":
      cost =
        (response?.usage?.prompt_tokens || 0) * 0.000005 +
        (response?.usage?.completion_tokens || 0) * 0.000015;
      break;
    case "vision":
      cost = 0.000425;
      break;
  }

  return cost;
}

/**
 * Adds a new Log item record in the "Threads" table.
 * @param {CreateLog} logData The data for the new Log item to be created.
 * @returns {Promise<void>} A promise resolving to the newly created Log item record.
 */
async function createLog(logData: CreateLog): Promise<void> {
  try {
    logData.cost = calculateCost(logData);

    const { response } = logData;
    const airtableData: FieldSet = {
      action: logData.action,
      messages: response?.choices?.[0]?.message?.content || undefined,
      total_tokens: response?.usage?.total_tokens || 0,
      prompt_tokens: response?.usage?.prompt_tokens || 0,
      completion_tokens: response?.usage?.completion_tokens || 0,
      modelType: logData.modelType,
      cost: logData.cost,
    };

    const createdRecords: Records<FieldSet> = await airtable("Logs").create([
      { fields: airtableData },
    ]);

    if (createdRecords && createdRecords.length > 0) {
      console.log("Logged");
    } else {
      throw new Error("No records were created.");
    }
  } catch (error) {
    console.error("Failed to create the log:", error);
    throw error;
  }
}

// Export the functions for use in other components
export { createLog };

// Export types
export type { CreateLog };

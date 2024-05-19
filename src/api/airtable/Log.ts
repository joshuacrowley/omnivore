import { airtable } from "./Airtable";
import { FieldSet, Records } from "airtable";

interface CreateLog {
  action: string;
  messages?: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
}

/**
 * Adds a new thread item record in the "Threads" table.
 * @param {CreateLog} logData The data for the new thread item to be created.
 * @returns {Promise<void>} A promise resolving to the newly created thread item record.
 */
async function createLog(logData: CreateLog): Promise<void> {
  try {
    const airtableData: FieldSet = {
      action: logData.action,
      messages: logData.messages,
      total_tokens: logData.total_tokens,
      prompt_tokens: logData.prompt_tokens,
      completion_tokens: logData.completion_tokens,
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

import { airtable, Airtable, Select } from "./Airtable";
import { FieldSet, Records, Attachment } from "airtable";

// Define an interface for the Airtable record fields for the "Threads" table
interface ThreadItem {
  id: string;
  threadId: string;
  topic: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateThreadItem {
  threadId: string;
  topic: string;
}

interface UpdateThreadItem {
  id: string;
  fields: {
    threadId?: string;
    topic?: string;
  };
}

/**
 * Fetches thread records from the "Threads" table with optional filters.
 * @param filters Additional options for querying the "Threads" table.
 * @returns A promise resolving to a list of thread records.
 */
async function getThreads(
  filters?: Airtable.SelectOptions<Select>
): Promise<ThreadItem[]> {
  const recordsList: ThreadItem[] = [];
  return new Promise((resolve, reject) => {
    airtable("Threads")
      .select(
        filters || {
          maxRecords: 10,
        }
      )
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            recordsList.push({
              id: record.id,
              threadId: record.fields.threadId as string,
              topic: record.fields.topic as string,
              createdAt: record.fields.createdAt as string,
              updatedAt: record.fields.updatedAt as string,
            });
          });
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }
          resolve(recordsList);
        }
      );
  });
}

/**
 * Adds a new thread item record in the "Threads" table.
 * @param {CreateThreadItem} threadData The data for the new thread item to be created.
 * @returns {Promise<ThreadItem>} A promise resolving to the newly created thread item record.
 */
async function addThread(threadData: CreateThreadItem): Promise<ThreadItem> {
  try {
    const airtableData: FieldSet = {
      threadId: threadData.threadId,
      topic: threadData.topic,
    };

    const createdRecords: Records<FieldSet> = await airtable("Threads").create([
      { fields: airtableData },
    ]);

    if (createdRecords && createdRecords.length > 0) {
      const record = createdRecords[0];
      return {
        id: record.id,
        threadId: record.fields.threadId as string,
        topic: record.fields.topic as string,
        createdAt: record.fields.createdAt as string,
        updatedAt: record.fields.updatedAt as string,
      };
    } else {
      throw new Error("No records were created.");
    }
  } catch (error) {
    console.error("Failed to create the thread item:", error);
    throw error;
  }
}

/**
 * Updates existing thread item records in the "Threads" table.
 * @param {UpdateThreadItem[]} updates Array of thread data with ids for updates.
 * @returns {Promise<ThreadItem[]>} A promise resolving to the list of updated thread item records.
 */
async function updateThreads(
  updates: UpdateThreadItem[]
): Promise<ThreadItem[]> {
  try {
    const formattedUpdates = updates.map((update) => ({
      id: update.id,
      fields: update.fields,
    }));

    const updatedRecords: Records<FieldSet> = await airtable("Threads").update(formattedUpdates);

    return updatedRecords.map((record) => ({
      id: record.id,
      threadId: record.fields.threadId as string,
      topic: record.fields.topic as string,
      createdAt: record.fields.createdAt as string,
      updatedAt: record.fields.updatedAt as string,
    }));
  } catch (error) {
    console.error("Failed to update thread items:", error);
    throw error;
  }
}

// Export the functions for use in other components
export { getThreads, addThread, updateThreads };

// Export types
export type { ThreadItem, CreateThreadItem, UpdateThreadItem };

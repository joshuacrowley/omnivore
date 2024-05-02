import { openai } from "./OpenAi";
import { getThreads, ThreadItem } from "../airtable/Threads";

interface OpenAIThread {
  id: string;
  object: string;
  created_at: number; // UNIX timestamp for when the thread was created
  metadata: object;
  tool_resources: {
    code_interpreter?: {
      file_ids: string[];
    };
  };
}

interface EnrichedThread extends OpenAIThread {
  topic: string;
  updatedAt: string | undefined; // Now allows undefined
}

async function findThreads(): Promise<EnrichedThread[]> {
  try {
    // Retrieve all threads from Airtable
    const airtableThreads: ThreadItem[] = await getThreads();

    // Map over each thread from Airtable to retrieve the full thread object from OpenAI
    const threadsPromises = airtableThreads.map(async (thread) => {
      const threadDetails = (await openai.beta.threads.retrieve(
        thread.threadId
      )) as OpenAIThread;
      // Enrich the OpenAI thread details with Airtable data
      return {
        ...threadDetails,
        topic: thread.topic,
        updatedAt: thread.updatedAt,
      };
    });

    // Use Promise.all to wait for all OpenAI API calls and mapping to resolve
    const enrichedThreads = await Promise.all(threadsPromises);

    return enrichedThreads;
  } catch (error) {
    console.error("Failed to retrieve threads:", error);
    throw error; // Or handle the error as needed
  }
}

async function getThreadMessages(id: string) {
  try {
    const messages = await openai.beta.threads.messages.list(id);

    console.log("getThreadMessages", messages);

    return messages;
  } catch (error) {
    console.error("Failed to retrieve threads:", error);
    // Depending on your error handling strategy, you might want to rethrow, handle or log the error differently
    throw error;
  }
}

export { findThreads, getThreadMessages };

export type { EnrichedThread };

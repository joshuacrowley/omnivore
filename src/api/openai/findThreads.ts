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

interface Content {
  type: "text" | "image"; // Adjust based on actual usage
  text?: {
    value: string;
  };
  // Add other properties based on your actual data structure
}

interface EnrichedThread extends OpenAIThread {
  topic: string;
  updatedAt: string | undefined; // Now allows undefined
}

// Define the structure of the message and the data you expect to manipulate
interface Message {
  role: string;
  content: { type: string; text?: { value: string } }[];
}

interface ThreadMessages {
  body: { data: Message[] };
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
    // Simulating the API call to fetch messages from a thread
    const messages = await openai.beta.threads.messages.list(id);

    console.log("getThreadMessages", messages);

    // Map the messages to a simpler format before returning
    //@ts-ignore
    const mappedMessages = messages.body.data.reverse().map((message) => {
      const role = message.role;
      const textContent =
        message.content.find((content: Content) => content.type === "text")
          ?.text?.value || "";

      return {
        role: role,
        text: textContent,
      };
    });

    return mappedMessages; // Return the mapped messages
  } catch (error) {
    console.error("Failed to retrieve threads:", error);
    throw error; // Rethrow the error after logging
  }
}
// Send a new message to a thread
async function addMessage(threadId: string, text: string) {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: text,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: "asst_Hbmi76iEKiYzSSr40Ve8GHm9",
  });

  return new Response(stream.toReadableStream());
}

// Send a new message to a thread
async function addTool(toolCallOutputs: any, runId: string, threadId: string) {
  const stream = openai.beta.threads.runs.submitToolOutputsStream(
    threadId,
    runId,
    // { tool_outputs: [{ output: result, tool_call_id: toolCallId }] },
    { tool_outputs: toolCallOutputs }
  );

  return new Response(stream.toReadableStream());
}

export { findThreads, getThreadMessages, addMessage, addTool };

export type { EnrichedThread };

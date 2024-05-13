import { openai } from "./OpenAi";
import { getThreads, ThreadItem, addThread } from "../airtable/Threads";

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

interface CreateThreadParams {
  topic: string; // Example parameter, adjust based on your actual data structure
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
  if (!process.env.REACT_APP_ASSISTANT_ID) {
    throw new Error("ENV REACT_APP_ASSISTANT_ID needs to be set");
  }

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: text,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: process.env.REACT_APP_ASSISTANT_ID,
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

// Function to create a new thread and add it to Airtable
async function createThread(params: CreateThreadParams): Promise<any> {
  try {
    // Create a new thread via OpenAI
    const newThread = await openai.beta.threads.create({});

    // Prepare data for Airtable (assumed fields, please adjust as necessary)
    const airtableData = {
      threadId: newThread.id,
      topic: params.topic,
    };

    // Add the new thread details to Airtable
    addThread(airtableData);

    // Return the new thread ID or the whole thread item based on your requirement
    return newThread;
  } catch (error) {
    console.error("Failed to create a new thread:", error);
    throw error; // Or handle the error as needed
  }
}

export { findThreads, getThreadMessages, addMessage, addTool, createThread };

export type { EnrichedThread };

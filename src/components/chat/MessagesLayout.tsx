import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  useToast,
  CircularProgress,
  Input,
} from "@chakra-ui/react";
import { FiMic, FiRepeat, FiSend } from "react-icons/fi";
import { ChatMessage } from "./ChatMessage";
import { ChatMessages } from "./ChatMessages";
import { ChatTextarea } from "./ChatTextarea";
import { useKitchen } from "../../KitchenContext";
import { openai } from "../../api/openai/OpenAi";

// Define the types for the messages and content
interface Message {
  id: string;
  role: "assistant" | "user";
  content: Content[];
  created_at: number;
}

interface Content {
  type: "text" | "image"; // Adjust based on actual usage
  text?: {
    value: string;
  };
  // Add other properties based on your actual data structure
}

const ASSISTANT_ID = "asst_Hbmi76iEKiYzSSr40Ve8GHm9";

const Messages = () => {
  const { messageList, setMessageList, fetchThreadMessages, selectedThread } =
    useKitchen();
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchThreadMessages();
  }, [selectedThread]);

  const handleSendMessage = async () => {
    setIsWaiting(true);
    try {
      if (openai) {
        await openai.beta.threads.messages.create(selectedThread.id, {
          role: "user",
          content: input,
        });

        // We use the stream SDK helper to create a run with
        // streaming. The SDK provides helpful event listeners to handle
        // the streamed response.

        console.log("assistant_id", ASSISTANT_ID);

        const run = openai.beta.threads.runs
          .stream(selectedThread.id, {
            assistant_id: ASSISTANT_ID as string,
          })
          .on("textCreated", (text) => console.log("\nassistant > "))
          .on("textDelta", (textDelta, snapshot) =>
            console.log(textDelta.value)
          )
          .on("toolCallCreated", (toolCall) =>
            console.log(`\nassistant > ${toolCall.type}\n\n`)
          );

        const messageList = await openai.beta.threads.messages.list(
          selectedThread.id
        );

        console.log("messageList", messageList);

        //setMessageList(messageList);
      }
    } catch (error) {
      toast({
        title: "Error sending message",
        description: (error as any).message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    setIsWaiting(false);
    setInput("");
  };

  console.log("messageList", messageList);

  return (
    <Flex direction="column" p="5">
      {messageList && (
        <ChatMessages>
          {messageList.data.map((message: Message, index: number) => (
            <ChatMessage key={index} message={message} />
          ))}
        </ChatMessages>
      )}
      <Input
        placeholder="Type your message here..."
        value={input}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setInput(e.target.value)
        }
        onKeyPress={(e: React.KeyboardEvent) =>
          e.key === "Enter" && handleSendMessage()
        }
      />
      {isWaiting && <CircularProgress isIndeterminate color="green.300" />}
      <Button
        rightIcon={<FiSend />}
        colorScheme="teal"
        variant="outline"
        onClick={handleSendMessage}
        disabled={isWaiting}
      >
        Send
      </Button>
    </Flex>
  );
};

export default Messages;

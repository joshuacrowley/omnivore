import React, { useEffect } from "react";
import { Box, Button, Flex, HStack, Stack } from "@chakra-ui/react";
import { FiDownloadCloud, FiRepeat, FiSend } from "react-icons/fi";
import { ChatActionButton } from "./ChatActionButton";
import { ChatMessage } from "./ChatMessage";
import { ChatMessages } from "./ChatMessages";
import { ChatTextarea } from "./ChatTextarea";
import { useKitchen } from "../../KitchenContext";

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

export const Messages = () => {
  const { messageList, fetchThreadMessages, selectedThread } = useKitchen(); // Get the message list from context

  useEffect(() => {
    fetchThreadMessages();
  }, [selectedThread]);
  console.log("messageList", messageList);

  // Ensure messageList is populated before rendering
  if (!messageList || !messageList.body || !messageList.body.data) {
    return null; // Or render a loading indicator
  }

  return (
    <Flex
      direction="column"
      pos="relative"
      bg="bg.canvas"
      height="100vh"
      overflow="hidden"
    >
      <Box overflowY="auto" paddingTop="20" paddingBottom="40">
        <ChatMessages>
          {messageList.body.data.map((message: Message, index: number) => (
            <ChatMessage
              key={index}
              author={{
                name: message.role === "assistant" ? "Assistant" : "User",
                image: "",
              }} // Assuming you adjust according to the expected type
              //@ts-ignore
              content={message.content
                .map((content: Content) =>
                  content.type === "text" && content.text
                    ? content.text.value
                    : ""
                )
                .join(" ")}
              createdAt={new Date(message.created_at * 1000).toLocaleString()} // Formatting UNIX timestamp
            />
          ))}
        </ChatMessages>
      </Box>

      <Box
        pos="absolute"
        bottom="0"
        insetX="0"
        bgGradient="linear(to-t, bg.canvas 80%, rgba(0,0,0,0))"
        paddingY="8"
        marginX="4"
      >
        <Stack maxW="prose" mx="auto">
          <HStack>
            <ChatActionButton icon={FiRepeat}>Regenerate</ChatActionButton>
            <ChatActionButton icon={FiDownloadCloud}>Download</ChatActionButton>
          </HStack>
          <Box as="form" pos="relative" pb="1">
            <ChatTextarea />
            <Box pos="absolute" top="3" right="0" zIndex="2">
              <Button size="sm" type="submit" variant="text" colorScheme="gray">
                <FiSend />
              </Button>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Flex>
  );
};

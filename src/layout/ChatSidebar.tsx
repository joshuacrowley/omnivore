import React from "react";
import {
  Link,
  Stack,
  StackProps,
  Text,
  useColorModeValue as mode,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useKitchen } from "../KitchenContext"; // Ensure this path is correct
import { EnrichedThread } from "../api/openai/findThreads"; // Ensure this path is correct

// Extend StackProps to include an optional onClose prop
interface ChatSidebarProps extends StackProps {
  onClose?: () => void;
}

export const ChatSidebar = (props: ChatSidebarProps) => {
  const { threads, selectedThread, setSelectedThread, loading, error } =
    useKitchen();

  console.log("threads", threads);
  console.log("selectedThread", selectedThread);

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>Error loading threads!</AlertTitle>
        <AlertDescription>
          There was a problem loading the threads. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Stack spacing={{ base: "1px", lg: "1" }} px={{ lg: "3" }} py="3">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} height="50px" borderRadius={{ lg: "lg" }} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack
      spacing={{ base: "1px", lg: "1" }}
      px={{ lg: "3" }}
      py="3"
      {...props}
    >
      {threads.map((thread: EnrichedThread) => (
        <Link
          key={thread.id}
          onClick={() => {
            setSelectedThread(thread);
            if (props.onClose) {
              props.onClose();
            }
          }}
          aria-current={thread.id === selectedThread?.id ? "page" : undefined}
          _hover={{
            textDecoration: "none",
            bg: mode("gray.100", "gray.700"),
          }}
          _activeLink={{ bg: "gray.700", color: "white" }}
          borderRadius={{ lg: "lg" }}
        >
          <Stack
            spacing="1"
            py={{ base: "3", lg: "2" }}
            px={{ base: "3.5", lg: "3" }}
            fontSize="sm"
            lineHeight="1.25rem"
          >
            <Text fontWeight="medium">{thread.topic}</Text>
            <Text opacity={0.8}>
              Created: {new Date(thread.created_at * 1000).toLocaleString()}
            </Text>
          </Stack>
        </Link>
      ))}
    </Stack>
  );
};

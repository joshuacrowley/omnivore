import Markdown from "markdown-to-jsx";
import {
  Avatar,
  Box,
  HStack,
  Stack,
  Text,
  Heading,
  Code,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";

// Define the types for the messages and content
interface Props {
  message: {
    id: string;
    role: "assistant" | "user";
    content: Content[];
    created_at: number;
  };
}

interface Content {
  type: "text" | "image"; // Adjust based on actual usage
  text?: {
    value: string;
  };
  // Add other properties based on your actual data structure
}

const markdownOptions = {
  overrides: {
    h1: { component: Heading, props: { size: "2xl", mt: 4, mb: 2 } },
    h2: { component: Heading, props: { size: "xl", mt: 4, mb: 2 } },
    h3: { component: Heading, props: { size: "lg", mt: 4, mb: 2 } },
    p: { component: Text, props: { mb: 4 } },
    a: { component: Link, props: { color: "teal.500", isExternal: true } },
    code: { component: Code, props: { p: 2, borderRadius: "md" } },
    ul: { component: Box, props: { as: "ul", pl: 5, mt: 2, mb: 4 } },
    li: { component: Box, props: { as: "li", mb: 1 } },
  },
};

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

export const ChatMessage = ({ role, text }: MessageProps) => {
  const bgColor = useColorModeValue(
    role === "user" ? "blue.50" : "gray.50",
    role === "user" ? "blue.700" : "gray.700"
  );
  const align = role === "user" ? "flex-start" : "flex-end";
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <HStack align="flex-start" gap="5" width="full">
      <Box width="full">
        <HStack align={align} gap="5" width="full" my={2}>
          <Text as="b">{role === "user" ? "You" : "🍐 Omni"}</Text>
        </HStack>
        <Box
          bg={bgColor}
          color={textColor}
          px={6}
          py={3}
          borderRadius="lg"
          maxWidth="100%"
        >
          <Markdown options={markdownOptions}>{text || ""}</Markdown>
        </Box>
      </Box>
    </HStack>
  );
};

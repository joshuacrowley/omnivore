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

export const ChatMessage = ({ message }: Props) => {
  const { role, content } = message;

  return (
    <HStack align="flex-start" gap="5">
      <Box pt="1">
        <Avatar size="sm" name={role} />
      </Box>
      <Stack spacing="1">
        <Text fontWeight="medium">{role}</Text>
        {content.map((item) => (
          <Stack spacing="2">
            <Box color="fg.muted" lineHeight="tall">
              <Markdown markdownOptions>{item.text?.value || ""}</Markdown>
            </Box>
          </Stack>
        ))}
      </Stack>
    </HStack>
  );
};

import { Avatar, Box, HStack, Stack, Text } from "@chakra-ui/react";

interface Props {
  author: { name: string; image: string };
  messages: React.ReactNode[];
}

export const ChatMessage = (props: Props) => {
  const { author, messages } = props;
  return (
    <HStack align="flex-start" gap="5">
      <Box pt="1">
        <Avatar size="sm" src={author.image} name={author.name} />
      </Box>
      <Stack spacing="1">
        <Text fontWeight="medium">{author.name}</Text>
        <Stack spacing="2">
          {messages.map((message, index) => (
            <Box key={index} color="fg.muted" lineHeight="tall">
              {message}
            </Box>
          ))}
        </Stack>
      </Stack>
    </HStack>
  );
};

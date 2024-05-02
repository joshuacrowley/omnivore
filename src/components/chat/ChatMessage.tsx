import { Avatar, Box, HStack, Stack, Text } from "@chakra-ui/react";

interface Props {
  author: { name: string; image: string };
  content: React.ReactNode[];
}

export const ChatMessage = (props: Props) => {
  const { author, content } = props;
  return (
    <HStack align="flex-start" gap="5">
      <Box pt="1">
        <Avatar size="sm" src={author.image} name={author.name} />
      </Box>
      <Stack spacing="1">
        <Text fontWeight="medium">{author.name}</Text>
        <Stack spacing="2">
          <Box color="fg.muted" lineHeight="tall">
            {content}
          </Box>
        </Stack>
      </Stack>
    </HStack>
  );
};

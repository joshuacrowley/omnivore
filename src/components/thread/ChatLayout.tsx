import { Box, Button, Flex, SimpleGrid, Stack } from "@chakra-ui/react";
import { BsImage } from "react-icons/bs";
import { FaReact } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { ChatTextarea } from "./ChatTextarea";
import { EmptyStatePrompt } from "./EmptyStatePrompt";
import { PromptSuggestButton } from "./PromptSuggestButton";

export const ChatLayout = () => {
  return (
    <Flex
      direction="column"
      pos="relative"
      bg="bg.canvas"
      height="100vh"
      overflow="hidden"
    >
      <Box overflowY="auto" paddingTop="20" paddingBottom="40" height="full">
        <EmptyStatePrompt>How can I help you?</EmptyStatePrompt>
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
          <SimpleGrid columns={2} spacing="2">
            <PromptSuggestButton
              icon={<BsImage />}
              title="Color Palette"
              description="Generate a color palette from an image"
            />
            <PromptSuggestButton
              icon={<BsImage />}
              title="Generate Image"
              description="Generate an image from a text prompt"
            />
            <PromptSuggestButton
              icon={<FaReact />}
              title="React component"
              description="Generate a React code from prompt"
            />
            <PromptSuggestButton
              icon={<HiSparkles />}
              title="Voice Magic"
              description="Create a magical UI from voice"
            />
          </SimpleGrid>

          <Box as="form" pos="relative" pb="1">
            <ChatTextarea rows={1} />
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

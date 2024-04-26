import React, { useState, useRef, FormEvent } from "react";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerFooter,
  useDisclosure,
  useToast,
  Flex,
  Box,
} from "@chakra-ui/react";
import { FiSend, FiPlus } from "react-icons/fi";
import { ChatMessage } from "./ChatMessage";
import { ChatMessages } from "./ChatMessages";
import { ChatTextarea } from "./ChatTextarea";
import {
  generateShoppingList,
  insertToShoppingTable,
} from "./openai/addIngredientsMessages";
import { useRecipe } from "./KitchenContext";
import { ShoppingItem } from "./airtable/Shopping";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AddManyIngredients = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const toast = useToast();
  const firstField = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);

  const handleIngredientSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    const newUserMessage: Message = {
      role: "user",
      content: description,
    };

    // Optimistically add the user message to the UI
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await generateShoppingList(
        messages.concat([newUserMessage])
      );
      const aiMessage: Message = {
        role: "assistant",
        content: response.choices[0].message.content || "", // Provide a default empty string if null
      };

      // Update the conversation with the AI response
      setMessages((prev) => [...prev, aiMessage]);

      const jsonResponse = JSON.parse(aiMessage.content);
      const shoppingItems = jsonResponse.ingredientsToAdd;
      const itemsToInsert = shoppingItems.map((item: ShoppingItem[]) => ({
        fields: item,
      }));
      const newItems = await insertToShoppingTable(itemsToInsert);

      toast({
        title: "Ingredients added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose(); // Close the drawer on success
      setDescription(""); // Clear the textarea after submission
    } catch (error) {
      toast({
        title: "Failed to add ingredients",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button leftIcon={<FiPlus />} onClick={onOpen}>
        Add many items
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        initialFocusRef={firstField}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Add Shopping</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" pos="relative" height="100vh">
              <Box overflowY="auto" p="4">
                <ChatMessages>
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      author={{
                        name: msg.role === "user" ? "You" : "Assistant",
                        image: "/path/to/image.png",
                      }} // Adjust image paths as needed
                      //@ts-ignore
                      message={msg.content}
                    />
                  ))}
                </ChatMessages>
              </Box>
              <Box
                as="form"
                onSubmit={handleIngredientSubmit}
                pos="absolute"
                bottom="0"
                insetX="0"
                p="4"
              >
                <ChatTextarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type your message..."
                />
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  rightIcon={<FiSend />}
                  mt="2"
                >
                  Send
                </Button>
              </Box>
            </Flex>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddManyIngredients;

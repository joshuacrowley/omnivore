import React, { useState } from "react";
import { useKitchen } from "../KitchenContext"; // Import the context
import { addIngredientsToList } from "../api/openai/addIngredients"; // Import the new function
import { FiPlus } from "react-icons/fi";
import { useWhisper } from "@chengsokdara/use-whisper";
import Listen from "./Listen";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerFooter,
  FormLabel,
  Textarea,
  Box,
  Stack,
  useDisclosure,
  useToast,
  useColorModeValue as mode,
} from "@chakra-ui/react";
import { ColumnButton } from "../layout/Column";

export const AddShopping = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { fetchShoppingRecords, setShoppingList } = useKitchen(); // Adjusted to use fetchShoppingRecords
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const toast = useToast();

  const { recording, transcribing, transcript, startRecording, stopRecording } =
    useWhisper({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

  const handleIngredientSubmit = async () => {
    setLoading(true);
    try {
      const newItems = await addIngredientsToList(description);
      setShoppingList((prev) => [...prev, ...newItems]); // Assuming setShoppingList updates your global or local state

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
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the description when the transcript updates
  React.useEffect(() => {
    if (transcript.text) {
      setDescription(transcript.text);
    }
  }, [transcript.text]);

  const firstField = React.useRef();

  return (
    <>
      <ColumnButton leftIcon={<FiPlus />} onClick={onOpen}>
        Add shopping
      </ColumnButton>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        initialFocusRef={firstField}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Add shopping</DrawerHeader>

          <DrawerBody>
            <Stack spacing="24px">
              <Box>
                <FormLabel htmlFor="desc">List items</FormLabel>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="5 tomatoes, milk, bread"
                  ref={firstField}
                />
              </Box>
              <Listen
                recording={recording}
                transcribing={transcribing}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button isLoading={loading} onClick={handleIngredientSubmit}>
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddShopping;

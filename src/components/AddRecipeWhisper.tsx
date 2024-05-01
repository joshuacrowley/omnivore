import React, { useState, useRef } from "react";
import { useKitchen } from "../KitchenContext";
import { runRecipe } from "../api/openai/addRecipe";
import { FiPlus } from "react-icons/fi";
import { useWhisper } from "@chengsokdara/use-whisper";
import PhotoUpload from "./AddPhoto";
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
} from "@chakra-ui/react";

export const AddRecipe = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setSelectedRecipe, fetchRecipes } = useKitchen();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const toast = useToast();

  const { recording, transcribing, transcript, startRecording, stopRecording } =
    useWhisper({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

  const handleRecipeSubmit = async () => {
    setLoading(true);
    try {
      await runRecipe(description, {
        setSelectedRecipe,
        fetchRecipes,
      });
      toast({
        title: "Recipe added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Failed to add recipe",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Handle cases where the error is not an instance of Error
        toast({
          title: "Failed to add recipe",
          description: "An unexpected error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
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

  const firstField = useRef();

  return (
    <>
      <Button leftIcon={<FiPlus />} onClick={onOpen}>
        Add Recipe
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        //@ts-ignore
        initialFocusRef={firstField}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Add Recipe</DrawerHeader>

          <DrawerBody>
            <Stack spacing="24px">
              <Box>
                <FormLabel htmlFor="desc">Recipe Description</FormLabel>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the recipe to generate..."
                />
                <Button onClick={startRecording} disabled={recording} mt="2">
                  Start Recording
                </Button>
                <Button onClick={stopRecording} disabled={!recording} mt="2">
                  Stop Recording
                </Button>
                <p>Recording: {recording ? "Yes" : "No"}</p>
                <p>Transcribing: {transcribing ? "Yes" : "No"}</p>

                <PhotoUpload />
              </Box>
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleRecipeSubmit} isLoading={loading}>
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

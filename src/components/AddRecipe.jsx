import React, { useState } from "react";
import { useKitchen } from "../KitchenContext"; // Import the context
import { runRecipe } from "../api/openai/addRecipe";
import { FiPlus } from "react-icons/fi";
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
  useColorModeValue as mode,
} from "@chakra-ui/react";

export const AddRecipe = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setSelectedRecipe, fetchRecipes } = useKitchen(); // Use runRecipe from the context
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const toast = useToast();

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
      onClose(); // Close the drawer on success
    } catch (error) {
      toast({
        title: "Failed to add recipe",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const firstField = React.useRef();

  return (
    <>
      <Button leftIcon={<FiPlus />} onClick={onOpen}>
        Add Recipe
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
          <DrawerHeader borderBottomWidth="1px">Add Recipe</DrawerHeader>

          <DrawerBody>
            <Stack spacing="24px">
              <Box>
                <FormLabel htmlFor="desc">Recipe description</FormLabel>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the recipe to generate..."
                />
              </Box>
              <PhotoUpload />
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

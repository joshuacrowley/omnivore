import React, { useState } from "react";
import { Button, Input, VStack, useToast } from "@chakra-ui/react";
import { useRecipe } from "./KitchenContext";
import { runRecipe } from "./openai/AddPhoto"; // Assuming this import path is correct

const PhotoUploadComponent: React.FC = () => {
  const { setSelectedRecipe, fetchRecipes } = useRecipe();
  const [file, setFile] = useState<string | null>(null);
  const toast = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      // Check file size (less than 20 MB) and type
      if (
        file.size > 20 * 1024 * 1024 ||
        !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
          file.type
        )
      ) {
        toast({
          title: "Unsupported File",
          description:
            "Please upload an image of type PNG, JPEG, GIF, or WEBP and size less than 20 MB.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFile(reader.result as string);
      };
      reader.onerror = (error) => {
        console.error("Error: ", error);
        toast({
          title: "Error reading file.",
          //@ts-ignore
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      };
    }
  };

  const handleSubmit = async () => {
    if (file) {
      try {
        await runRecipe(file, {
          setSelectedRecipe,
          fetchRecipes,
        });
        toast({
          title: "Recipe processed and added to Airtable!",
          description: "Your recipe has been successfully processed.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error: ", error);
        toast({
          title: "Failed to process recipe.",
          //@ts-ignore
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <VStack spacing={4}>
      <Input
        type="file"
        accept="image/png, image/jpeg, image/gif, image/webp"
        onChange={handleFileChange}
      />
      <Button onClick={handleSubmit} isDisabled={!file}>
        Process Recipe
      </Button>
    </VStack>
  );
};

export default PhotoUploadComponent;

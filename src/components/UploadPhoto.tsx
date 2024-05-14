import React, { useCallback, useState } from "react";
import {
  VStack,
  useToast,
  Center,
  Icon,
  Text,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { useKitchen } from "../KitchenContext";
import { runRecipe } from "../api/openai/addPhoto";
import { FiUploadCloud } from "react-icons/fi";
import { useDropzone } from "react-dropzone";

const PhotoUploadComponent: React.FC = () => {
  const { setSelectedRecipe, fetchRecipes } = useKitchen();
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();

  const processFile = useCallback(async (dataUrl: string) => {
    try {
      setLoading(true);
      await runRecipe(dataUrl, {
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
        description: (error as Error).message || "Unknown error",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

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
        processFile(reader.result as string);
      };
      reader.onerror = (error: ProgressEvent<FileReader>) => {
        console.error("Error: ", error);
        toast({
          title: "Error reading file.",
          description: error.target?.error?.message || "File reading failed",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      };
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <VStack spacing={4}>
      <Center
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        {...getRootProps()}
        cursor="pointer"
      >
        <input {...getInputProps()} />
        <VStack spacing={3}>
          <Icon
            as={FiUploadCloud}
            boxSize={10}
            color={isDragActive ? "blue.500" : "gray.500"}
          />
          <VStack spacing="1">
            {isLoading ? (
              <Spinner
                size="xl"
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
              />
            ) : (
              <>
                {" "}
                <HStack spacing="1" whiteSpace="nowrap">
                  <Text textStyle="sm" color="fg.muted">
                    or drag and drop
                  </Text>
                </HStack>
                <Text textStyle="xs" color="fg.muted">
                  PNG, JPG or GIF up to 2MB
                </Text>
              </>
            )}
          </VStack>
        </VStack>
      </Center>
    </VStack>
  );
};

export default PhotoUploadComponent;

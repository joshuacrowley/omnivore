import React, { useState, useEffect } from "react";
import {
  Box,
  Image,
  SkeletonCircle,
  useColorModeValue as mode,
} from "@chakra-ui/react";
import { getRecipeById, RecipeItem } from "../api/airtable/Recipe";
import { handleRecipeImageUpdate } from "../api/openai/makeIcon";
import { Attachment } from "airtable"; // Assuming FieldSet is available to import

const RecipePhoto: React.FC<{ recipe: RecipeItem }> = ({ recipe }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<Attachment[]>(recipe.photo || []);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = () => {
    if (images.length > 1) {
      // Cycle through images when clicked
      setCurrentIndex((currentIndex + 1) % images.length);
    }
  };

  useEffect(() => {
    const fetchUpdatedImages = async () => {
      setLoading(true);
      if (images.length === 0) {
        try {
          await handleRecipeImageUpdate(recipe, recipe.id);
          const updatedRecipe = await getRecipeById(recipe.id);
          if (updatedRecipe) {
            // Check if updatedRecipe is not null
            setImages(updatedRecipe.photo || []);
          } else {
            console.error("No updated recipe found");
            // Optionally, handle this scenario by setting a default state or providing user feedback
          }
        } catch (error) {
          console.error("Failed to update recipe images:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUpdatedImages();
  }, [recipe, images.length]);

  return (
    <Box
      p={5}
      maxWidth={"250px"}
      minWidth={"250px"}
      margin={"auto"}
      alignItems={"center"}
    >
      {loading ? (
        <Image
          borderRadius={"125px"}
          backgroundColor={mode("gray.100", "gray.700")}
          style={{ filter: "grayscale(100%)" }}
        />
      ) : (
        images.length > 0 && (
          <Image
            src={images[currentIndex].url || ""} // Display the image at the current index
            alt={`Recipe image ${currentIndex + 1}`}
            onClick={handleImageClick}
            borderRadius={"125px"}
            backgroundColor={mode("gray.100", "gray.700")}
            style={{ filter: "grayscale(100%)" }}
            onLoad={() => setLoading(false)}
          />
        )
      )}
    </Box>
  );
};

export default RecipePhoto;

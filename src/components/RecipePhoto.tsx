import React, { useState, useEffect, useRef } from "react";
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
  const hasFetchedRef = useRef(false); // useRef to track fetch state without causing re-renders

  const handleImageClick = () => {
    if (images.length > 1) {
      setCurrentIndex((currentIndex + 1) % images.length);
    }
  };

  useEffect(() => {
    const fetchUpdatedImages = async () => {
      if (!hasFetchedRef.current && images.length === 0) {
        // Check if fetched and if images are empty
        setLoading(true);
        try {
          await handleRecipeImageUpdate(recipe, recipe.id);
          const updatedRecipe = await getRecipeById(recipe.id);
          if (updatedRecipe && updatedRecipe.photo) {
            setImages(updatedRecipe.photo);
          } else {
            console.error("No updated recipe found");
          }
          hasFetchedRef.current = true; // Update the ref after fetching
        } catch (error) {
          console.error("Failed to update recipe images:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUpdatedImages();
  }, [recipe.id]); // Depend only on recipe.id if it uniquely identifies a recipe

  return (
    <Box
      p={5}
      maxWidth={"250px"}
      minWidth={"250px"}
      margin={"auto"}
      alignItems={"center"}
    >
      {loading ? (
        <SkeletonCircle
          size="250px"
          startColor={mode("gray.100", "gray.700")}
        />
      ) : (
        images.length > 0 && (
          <Image
            src={images[currentIndex].url || ""}
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

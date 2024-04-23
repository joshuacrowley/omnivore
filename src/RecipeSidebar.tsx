import React, { useEffect } from "react";
import {
  Link,
  Stack,
  StackProps,
  Text,
  useColorModeValue as mode,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useRecipe } from "./KitchenContext"; // Update import path if necessary
import { RecipeItem } from "./airtable/Recipe";
import { AddRecipe } from "./AddRecipe";

export const RecipeSidebar = (props: StackProps) => {
  const { recipes, selectedRecipe, setSelectedRecipe, loading, error } =
    useRecipe(); // Destructure the necessary state and functions from context

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading recipes!</AlertTitle>
        <AlertDescription>
          There was a problem loading the recipes. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <Stack
      spacing={{ base: "1px", lg: "1" }}
      px={{ lg: "3" }}
      py="3"
      {...props}
    >
      <AddRecipe />
      {recipes.map((recipe: RecipeItem) => (
        <Link
          key={recipe.id}
          onClick={() => setSelectedRecipe(recipe)} // Set the selectedRecipeId in context
          aria-current={recipe.id === selectedRecipe.id ? "page" : undefined} // Highlight the current recipe
          _hover={{
            textDecoration: "none",
            bg: mode("gray.100", "gray.700"),
          }}
          _activeLink={{ bg: "gray.700", color: "white" }}
          borderRadius={{ lg: "lg" }}
        >
          <Stack
            spacing="1"
            py={{ base: "3", lg: "2" }}
            px={{ base: "3.5", lg: "3" }}
            fontSize="sm"
            lineHeight="1.25rem"
          >
            <Text fontWeight="medium">{recipe.name}</Text>
            <Text opacity={0.8}>Serves: {recipe.serves}</Text>
            <Text opacity={0.6}>
              Ingredients: {recipe.ingredients?.substring(0, 50)}...
            </Text>
          </Stack>
        </Link>
      ))}
    </Stack>
  );
};

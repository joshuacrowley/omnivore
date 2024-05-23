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
  HStack,
} from "@chakra-ui/react";
import { useKitchen } from "../KitchenContext"; // Update import path if necessary
import { RecipeItem } from "../api/airtable/Recipe";
import RecipePhoto from "../components/RecipePhoto";

// Extend StackProps to include an optional onClose prop
interface RecipeSidebarProps extends StackProps {
  onClose?: () => void;
}

export const RecipeSidebar = (props: RecipeSidebarProps) => {
  const {
    recipes,
    recipeError,
    selectedRecipe,
    setSelectedRecipe,
    error,
    recipesLoading,
  } = useKitchen(); // Destructure the necessary state and functions from context

  const linkHoverBg = mode("gray.100", "gray.700");
  const activeLinkBg = mode("gray.700", "gray.700");
  const activeLinkColor = mode("gray.700", "white");

  if (recipeError) {
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

  if (recipesLoading) {
    return (
      <Stack spacing={{ base: "1px", lg: "1" }} px={{ lg: "3" }} py="3">
        {[...Array(7)].map((_, index) => (
          <Skeleton key={index} height="100px" borderRadius={{ lg: "lg" }} />
        ))}
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
      {recipes.map((recipe: RecipeItem) => (
        <Link
          key={recipe.id}
          onClick={() => {
            setSelectedRecipe(recipe);
            if (props.onClose) {
              props.onClose();
            }
          }}
          aria-current={recipe.id === selectedRecipe?.id ? "page" : undefined}
          _hover={{
            textDecoration: "none",
            bg: linkHoverBg,
          }}
          _activeLink={{ bg: "gray.700", color: "white" }}
          borderRadius={{ lg: "lg" }}
        >
          <HStack py={2} px={2} gap={2}>
            <RecipePhoto boxSize={"90px"} key={recipe.id} recipe={recipe} />
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
                {recipe.ingredients?.substring(0, 50)}...
              </Text>
            </Stack>
          </HStack>
        </Link>
      ))}
    </Stack>
  );
};

export default RecipeSidebar;

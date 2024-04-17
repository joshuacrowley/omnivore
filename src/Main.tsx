import React, { useEffect, useState } from "react";
import {
  Box,
  BoxProps,
  Heading,
  Stack,
  Text,
  useColorModeValue as mode,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useRecipe } from "./KitchenContext";
import Markdown from "markdown-to-jsx";

export const Main = (props: BoxProps) => {
  const { selectedRecipe, loading, error } = useRecipe(); // Get the loading and error states from context

  if (loading) {
    return (
      <Stack spacing="8" p="4">
        <Skeleton height="40px" />
        <Skeleton height="20px" />
        <Skeleton height="250px" />
      </Stack>
    );
  }

  if (error || !selectedRecipe) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Failed to Load Recipe</AlertTitle>
        <AlertDescription>
          Unable to load the recipe details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box as="main" {...props}>
      <Stack spacing="8">
        <Stack spacing="3">
          <Heading as="h1" size="lg" color={mode("gray.700", "white")}>
            {selectedRecipe.name}
          </Heading>
        </Stack>
        <Stack
          spacing="5"
          lineHeight="1.75"
          maxW="65ch"
          color={mode("blackAlpha.800", "whiteAlpha.800")}
        >
          <Markdown>{selectedRecipe.ingredients ?? "No ingredients"}</Markdown>
          <Markdown>{selectedRecipe.method ?? "No method"}</Markdown>
        </Stack>
      </Stack>
    </Box>
  );
};

import React, { useEffect, useState } from "react";
import {
  Box,
  BoxProps,
  Heading,
  Link,
  Code,
  Stack,
  Text,
  useColorModeValue as mode,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SkeletonCircle,
} from "@chakra-ui/react";
import { useKitchen } from "../KitchenContext";
import SpeakButton from "../components/Speak";
import Ask from "../components/Ask";
import Markdown from "markdown-to-jsx";
import RecipePhoto from "../components/RecipePhoto";
import { ChatLayout } from "../components/thread/ChatLayout";

const markdownOptions = {
  overrides: {
    h1: { component: Heading, props: { size: "2xl", mt: 4, mb: 2 } },
    h2: { component: Heading, props: { size: "xl", mt: 4, mb: 2 } },
    h3: { component: Heading, props: { size: "lg", mt: 4, mb: 2 } },
    p: { component: Text, props: { mb: 4 } },
    a: { component: Link, props: { color: "teal.500", isExternal: true } },
    code: { component: Code, props: { p: 2, borderRadius: "md" } },
    ul: { component: Box, props: { as: "ul", pl: 5, mt: 2, mb: 4 } },
    li: { component: Box, props: { as: "li", mb: 1 } },
  },
};

export const Main = (props: BoxProps) => {
  const {
    selectedRecipe,
    selectedThread,
    selectedMealPlan,
    selectedNav,
    loading,
    error,
  } = useKitchen(); // Get the loading and error states from context

  if (loading) {
    return (
      <Stack spacing="1" p="2">
        <Stack spacing="1" p="4" marginBlockEnd={6} align={"center"}>
          <SkeletonCircle size="125px" />
        </Stack>
        <Skeleton height="40px" marginBlockEnd={6} />
        <Skeleton height="40px" marginBlockEnd={6} />
        <Skeleton height="250px" />
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
      {selectedNav === ("Recipes" || "Shopping") ? (
        <>
          <Stack spacing="8">
            <Stack spacing="3">
              <RecipePhoto key={selectedRecipe.id} recipe={selectedRecipe} />

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
              <Ask questionContext={JSON.stringify(selectedRecipe)} />
              <Markdown>
                {selectedRecipe.ingredients ?? "No ingredients"}
              </Markdown>
              <SpeakButton
                input={selectedRecipe.method}
                label={"Read method"}
              />
              <Markdown>{selectedRecipe.method ?? "No method"}</Markdown>
            </Stack>
          </Stack>
        </>
      ) : (
        false
      )}

      {selectedNav === "Meal plan" ? (
        <>
          <Stack spacing="8">
            <Stack spacing="3">
              <Heading as="h1" size="lg" color={mode("gray.700", "white")}>
                {selectedMealPlan.name}
              </Heading>
            </Stack>
            <Stack
              spacing="5"
              lineHeight="1.75"
              maxW="65ch"
              color={mode("blackAlpha.800", "whiteAlpha.800")}
            >
              <Ask
                questionContext={JSON.stringify(selectedMealPlan.runsheet)}
              />
              <Markdown options={markdownOptions}>
                {selectedMealPlan.runsheet ?? "No runsheet"}
              </Markdown>
            </Stack>
          </Stack>
        </>
      ) : (
        false
      )}

      {selectedNav === "Chat" ? (
        <>
          <Stack spacing="8">
            <Stack spacing="3">
              <Heading as="h1" size="lg" color={mode("gray.700", "white")}>
                {selectedThread.topic}
              </Heading>
            </Stack>
            <Stack
              spacing="5"
              lineHeight="1.75"
              maxW="65ch"
              color={mode("blackAlpha.800", "whiteAlpha.800")}
            >
              <ChatLayout />
            </Stack>
          </Stack>
        </>
      ) : (
        false
      )}
    </Box>
  );
};

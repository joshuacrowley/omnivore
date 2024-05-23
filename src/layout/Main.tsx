import React, { Component, useEffect, useState } from "react";
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
  Image,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ListItem,
  OrderedList,
  UnorderedList,
  HStack,
  Divider,
  Highlight,
} from "@chakra-ui/react";
import { useKitchen } from "../KitchenContext";
import SpeakButton from "../components/Speak";
import Ask from "../components/Ask";
import Markdown from "markdown-to-jsx";
import RecipePhoto from "../components/RecipePhoto";
import { ChatWrapper } from "../components/chat/ChatWrapper";
import { AddMeal } from "../components/AddMeal";

const markdownOptions = {
  overrides: {
    h1: { component: Heading, props: { size: "xl", mt: 4, mb: 2 } },
    h2: { component: Heading, props: { size: "lg", mt: 4, mb: 4 } },
    h3: { component: Heading, props: { size: "md", mt: 4, mb: 4 } },
    p: { component: Text, props: { mb: 4 } },
    a: { component: Link, props: { color: "teal.500", isExternal: true } },
    code: { component: Code, props: { p: 2, borderRadius: "md" } },
    ul: {
      component: UnorderedList,
      props: {
        as: "ul",
        pl: 5,
        mt: 2,
        mb: 4,
        styleType: "disc",
        stylePosition: "inside",
      },
    },
    ol: {
      component: OrderedList,
      props: {
        as: "ol",
        pl: 5,
        mt: 2,
        mb: 4,
        styleType: "decimal",
        stylePosition: "inside",
      },
    },

    li: { component: ListItem, props: { mb: 1 } },
    table: {
      component: Table,
      props: { variant: "simple", size: "sm", mb: 8, mt: 8 },
    },
    thead: { component: Thead },
    tbody: { component: Tbody },
    tr: { component: Tr },
    th: { component: Th, props: { isNumeric: false } }, // set `isNumeric` to true if your data is mostly numeric
    td: { component: Td },
    AlertIcon: { component: AlertIcon },
    Alert: { component: Alert },
    Highlight: { component: Highlight },
  },
};

export const Main = (props: BoxProps) => {
  const {
    selectedRecipe,

    shortCutActive,
    selectedMealPlan,
    selectedNav,
    loading,
    error,
    recipeError,
  } = useKitchen(); // Get the loading and error states from context

  const backgroundColor = mode("gray.100", "gray.700");
  const h1Colour = mode("gray.700", "white");
  const stackColour = mode("blackAlpha.800", "whiteAlpha.800");

  if (loading) {
    return (
      <Box as="main" {...props}>
        <Stack spacing="1" p="2">
          <Stack spacing="1" p="4" marginBlockEnd={6}>
            <Image
              alt={`loading`}
              borderRadius="full"
              boxSize="150px"
              backgroundColor={backgroundColor}
              style={{ filter: "grayscale(100%)" }}
              fallbackSrc="./Circle.svg"
            />
          </Stack>
          <Skeleton height="40px" marginBlockEnd={6} />
          <Skeleton height="40px" marginBlockEnd={6} />
          <Skeleton height="250px" />
          <Skeleton height="250px" />
        </Stack>
      </Box>
    );
  }

  if (recipeError) {
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

  if (!selectedRecipe) {
    return <></>;
  }

  return (
    <Box as="main" {...props}>
      {["Recipes", "Shopping"].includes(selectedNav) ? (
        <>
          <Stack spacing="10">
            <Stack spacing="6">
              <RecipePhoto
                key={selectedRecipe.id}
                recipe={selectedRecipe}
                boxSize="150px"
              />

              <Heading as="h1" size="2xl" color={h1Colour}>
                {selectedRecipe.name}
              </Heading>
            </Stack>

            <Stack
              spacing="5"
              lineHeight="1.75"
              maxW="65ch"
              color={stackColour}
            >
              <HStack gap={3}>
                <AddMeal />
                <Ask
                  questionContext={JSON.stringify(selectedRecipe)}
                  shortCutActive={shortCutActive}
                />
                {selectedRecipe.method && (
                  <SpeakButton
                    input={selectedRecipe.method}
                    label={"Read method"}
                  />
                )}
              </HStack>
              <Divider />

              <Heading as="h1" size="md" color={h1Colour}>
                Ingredients
              </Heading>
              <Markdown options={markdownOptions}>
                {selectedRecipe.ingredients ?? "No ingredients"}
              </Markdown>
              <Heading as="h1" size="md" color={h1Colour}>
                Method
              </Heading>
              <Markdown options={markdownOptions}>
                {selectedRecipe.method ?? "No method"}
              </Markdown>
            </Stack>
            <Divider />
          </Stack>
        </>
      ) : (
        false
      )}

      {/* {selectedNav === "Shopping" ? <VideoFeedComponent /> : false} */}

      {selectedNav === "Meal plan" ? (
        <>
          {selectedMealPlan ? (
            <Stack spacing="8">
              <Stack spacing="3">
                <Heading as="h1" size="2xl" color={h1Colour}>
                  {selectedMealPlan.name}
                </Heading>
              </Stack>
              <Stack
                spacing="5"
                lineHeight="1.75"
                maxW="65ch"
                color={stackColour}
              >
                <Ask
                  questionContext={JSON.stringify(selectedMealPlan.runsheet)}
                  shortCutActive={shortCutActive}
                />
                <Divider />
                <Markdown options={markdownOptions}>
                  {selectedMealPlan.runsheet ?? "No runsheet"}
                </Markdown>
                <Divider />
              </Stack>
            </Stack>
          ) : (
            <Heading as="h1" size="lg" color={h1Colour}>
              You have 0 meals planned
            </Heading>
          )}
        </>
      ) : (
        false
      )}

      {selectedNav === "Chat" ? <ChatWrapper /> : false}
    </Box>
  );
};

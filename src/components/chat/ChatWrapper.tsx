// @ts-nocheck
import React, { useState } from "react";
import { useKitchen } from "../../KitchenContext";
import { runRecipe } from "../../api/openai/addRecipe";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import Chat from "./Chat";
import { useToast } from "@chakra-ui/react";

export const ChatWrapper = () => {
  const { setSelectedRecipe, fetchRecipes, selectedRecipe } = useKitchen();
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const functionCallHandler = async (call: RequiredActionFunctionToolCall) => {
    if (call?.function?.name !== "add_recipe") return;
    const args = JSON.parse(call.function.arguments);

    try {
      await runRecipe(args.prompt as string, {
        setSelectedRecipe,
        fetchRecipes,
      });
      toast({
        title: "Recipe added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Failed to add recipe",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Handle cases where the error is not an instance of Error
        toast({
          title: "Failed to add recipe",
          description: "An unexpected error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }

    return JSON.stringify(selectedRecipe);
  };

  return (
    <>
      <Chat functionCallHandler={functionCallHandler} />
    </>
  );
};

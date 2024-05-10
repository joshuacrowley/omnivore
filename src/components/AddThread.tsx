import React, { useState, useRef } from "react";
import { useKitchen } from "../KitchenContext";
import { createThread } from "../api/openai/threads";
import { FiPlus } from "react-icons/fi";
import { useToast } from "@chakra-ui/react";

import { ColumnButton } from "../layout/Column";

export const AddThread = () => {
  const { setSelectedThread, fetchThreadMessages } = useKitchen();

  const toast = useToast();

  const handleNewChat = async () => {
    try {
      const thread = await createThread({ topic: "New chat" });
      console.log(thread);

      await fetchThreadMessages();
      setSelectedThread(thread);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Failed to create chat",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Handle cases where the error is not an instance of Error
        toast({
          title: "Failed to create chat",
          description: "An unexpected error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
    }
  };

  return (
    <ColumnButton leftIcon={<FiPlus />} onClick={() => handleNewChat()}>
      New chat
    </ColumnButton>
  );
};

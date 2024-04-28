import React from "react";
import { Button, useToast } from "@chakra-ui/react";
import speak from "./openai/speak"; // Ensure this is the correct path to your speak function

interface SpeakButtonProps {
  input: string;
  label: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ input, label }) => {
  const toast = useToast();

  const handleOnClick = async () => {
    try {
      await speak(input);
    } catch (error: unknown) {
      // TypeScript treats error as `unknown` by default
      let message = "An unexpected error occurred";
      if (error instanceof Error) {
        message = error.message; // Now we can safely access the `message` property
      }
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return <Button onClick={handleOnClick}>{label}</Button>;
};

export default SpeakButton;

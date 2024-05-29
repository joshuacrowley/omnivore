import React, { useState } from "react";
import { Button, useToast } from "@chakra-ui/react";
import speak from "../api/openai/speak"; // Ensure this is the correct path to your speak function
import { FiSpeaker } from "react-icons/fi";

interface SpeakButtonProps {
  input: string;
  label: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ input, label }) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleOnClick = async () => {
    setIsLoading(true);
    try {
      await speak(input);
    } catch (error: unknown) {
      let message = "An unexpected error occurred";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={"outline"}
      onClick={handleOnClick}
      rightIcon={<FiSpeaker />}
      size={{ base: "sm", lg: "md" }}
      isLoading={isLoading}
      loadingText="Loading..."
    >
      {label}
    </Button>
  );
};

export default SpeakButton;

import React, { useState, useEffect } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { useWhisper } from "@chengsokdara/use-whisper";
import { FiMic, FiXOctagon } from "react-icons/fi";

import { ask } from "../api/openai/ask";
import speak from "../api/openai/speak";

interface AskProps {
  questionContext: string;
  shortCutActive: boolean;
}

const Ask: React.FC<AskProps> = ({ questionContext, shortCutActive }) => {
  const [asking, setAsking] = useState(false);
  const toast = useToast();

  const { recording, transcribing, startRecording, stopRecording, transcript } =
    useWhisper({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

  // Event handlers for keyboard
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "a" && !recording) {
      if (shortCutActive) {
        startRecording();
        handleAskClick();
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "a" && recording) {
      handleStopRecording();
    }
  };

  // Add and remove event listeners for keyboard
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [recording]); // Only re-run if 'recording' changes

  const handleAskClick = async () => {
    setAsking(true);
    startRecording();
  };

  const handleStopRecording = async () => {
    stopRecording();
    setAsking(false);

    try {
      // Send user message for completion
      //@ts-ignore
      const response = await ask(transcript.text, questionContext);

      toast({
        title: "Question",
        description: transcript.text,
        status: "info",
        variant: "subtle",
        position: "top-right",
        duration: 5000,
        isClosable: true,
      });

      if (response) {
        await speak(response);

        toast({
          title: "Answer",
          description: response,
          status: "info",
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error("No response from OpenAI.");
      }
    } catch (error) {
      console.error("Error processing OpenAI completion:", error);
      toast({
        title: "Error",
        description: "Failed to get response from OpenAI.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <div>
      {!recording && !transcribing && (
        <Button
          rightIcon={<FiMic />}
          onClick={handleAskClick}
          disabled={asking || recording}
        >
          Ask
        </Button>
      )}

      {recording && (
        <Button
          colorScheme="red"
          rightIcon={<FiXOctagon />}
          onClick={handleStopRecording}
        >
          Stop Recording
        </Button>
      )}
      {transcribing && (
        <Button isLoading loadingText="Transcribing..."></Button>
      )}
    </div>
  );
};

export default Ask;

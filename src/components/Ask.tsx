import React, { useState, useEffect } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { useWhisper } from "@chengsokdara/use-whisper";
import { FiMic, FiXOctagon } from "react-icons/fi";
import { createLog } from "../api/airtable/Log";
import { ask } from "../api/openai/ask";
import speak from "../api/openai/speak";

interface AskProps {
  questionContext: string;
  shortCutActive: boolean;
}

const Ask: React.FC<AskProps> = ({ questionContext, shortCutActive }) => {
  const [asking, setAsking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string | null>(
    null
  );
  const toast = useToast();

  const { recording, transcribing, startRecording, stopRecording, transcript } =
    useWhisper({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

  useEffect(() => {
    if (transcript.text && transcript.text !== currentTranscript) {
      setCurrentTranscript(transcript.text);
      handleTranscriptionComplete(transcript.text);
    }
  }, [transcript]);

  const handleAskClick = async () => {
    setAsking(true);
    setStartTime(Date.now());
    setCurrentTranscript(null);
    startRecording();
  };

  const handleStopRecording = async () => {
    stopRecording();
    setAsking(false);
  };

  const handleTranscriptionComplete = async (transcriptText: string) => {
    if (startTime) {
      const duration = Math.round((Date.now() - startTime) / 1000); // Calculate duration in seconds
      createLog({
        action: "useWhisper",
        seconds: duration,
        modelType: "speech to text",
      });
    }

    try {
      if (!transcriptText) {
        throw new Error("No transcript available.");
      }

      console.log("ASK");

      // Send user message for completion
      const response = await ask(transcriptText, questionContext);

      toast({
        title: "Question",
        description: transcriptText,
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
          variant={"outline"}
          onClick={handleAskClick}
          disabled={asking || recording}
          size={{ base: "sm", lg: "md" }}
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

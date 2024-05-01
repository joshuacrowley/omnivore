import React, { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { FiMic, FiXOctagon } from "react-icons/fi";

interface ListenProps {
  recording: boolean;
  transcribing: boolean;
  startRecording: Function;
  stopRecording: Function;
}

const Listen: React.FC<ListenProps> = ({
  recording,
  transcribing,
  startRecording,
  stopRecording,
}) => {
  // Event handlers for keyboard
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "a" && !recording) {
      startRecording();
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
    startRecording();
  };

  const handleStopRecording = async () => {
    stopRecording();
  };

  return (
    <div>
      {!recording && !transcribing && (
        <Button
          rightIcon={<FiMic />}
          onClick={handleAskClick}
          disabled={recording}
          size={"sm"}
        >
          Describe
        </Button>
      )}

      {recording && (
        <Button
          colorScheme="red"
          rightIcon={<FiXOctagon />}
          onClick={handleStopRecording}
          size={"sm"}
        >
          Stop Recording
        </Button>
      )}
      {transcribing && (
        <Button isLoading size={"sm"} loadingText="Transcribing..."></Button>
      )}
    </div>
  );
};

export default Listen;

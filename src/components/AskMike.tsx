import React, { useState, useEffect, useRef } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { useWhisper } from "@chengsokdara/use-whisper";
import { FiMic, FiXOctagon } from "react-icons/fi";

import { ask } from "../api/openai/ask";
import speak from "../api/openai/speak";

interface AskProps {
  questionContext: string;
  shortCutActive: boolean;
}

function genBgm() {
  // http://soundfile.sapp.org/doc/WaveFormat/
  const SAMPLE_RATE = 48000;
  const NUM_SAMPLES = SAMPLE_RATE * 20; // 20s

  const NUM_CHANNELS = 1;
  const BITS_PER_SAMPLE = 16;

  const SUB_CHUNK2_SIZE = (NUM_SAMPLES * NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
  const BYTE_RATE = (SAMPLE_RATE * NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
  const BLOCK_ALIGN = (NUM_CHANNELS * BITS_PER_SAMPLE) / 8;

  const bytes = new Uint8Array(44 + SUB_CHUNK2_SIZE);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, 0x52494646); // "RIFF"
  view.setUint32(4, 36 + SUB_CHUNK2_SIZE, true);
  view.setUint32(8, 0x57415645); // "WAVE"
  view.setUint32(12, 0x666d7420); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (PCM = 16)
  view.setUint16(20, 1, true); // AudioFormat (PCM = 1)
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, BYTE_RATE, true);
  view.setUint16(32, BLOCK_ALIGN, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  view.setUint32(36, 0x64617461); // "data"
  view.setUint32(40, SUB_CHUNK2_SIZE, true);

  const soundData = new Uint16Array(bytes.buffer, 44);
  soundData.fill(1000);

  const blob = new Blob([bytes], {
    type: "audio/wav",
  });
  return URL.createObjectURL(blob);
}

const Ask: React.FC<AskProps> = ({ questionContext, shortCutActive }) => {
  const [asking, setAsking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null); // Specifying the type of the ref

  const toast = useToast();

  const { recording, transcribing, startRecording, stopRecording, transcript } =
    useWhisper({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

  // Media Session handlers
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("pause", () => {
        if (!recording) {
          startRecording();
          setAsking(true);
        } else {
          stopRecording();
          setAsking(false);
        }
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        if (recording) {
          stopRecording();
          processRecording();
        }
      });
    }
  }, [recording]); // Dependencies to ensure they are captured in closure

  const processRecording = async () => {
    try {
      // Send user message for completion
      //@ts-ignore
      const response = await ask(transcript.text, questionContext);
      if (transcript && transcript.text) {
        displayToast("Question", transcript.text, "info");
      }

      if (response) {
        await speak(response);
        displayToast("Answer", response, "info");
      } else {
        throw new Error("No response from OpenAI.");
      }
    } catch (error) {
      console.error("Error processing OpenAI completion:", error);
      displayToast("Error", "Failed to get response from OpenAI.", "error");
    }
  };

  const displayToast = (
    title: string,
    description: string,
    status: "info" | "warning" | "success" | "error" | "loading" | undefined
  ) => {
    toast({
      title,
      description,
      status,
      variant: "subtle",
      position: "top-right",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <div>
      {!recording && !transcribing && (
        <Button
          rightIcon={<FiMic />}
          onClick={() => {
            startRecording();
            setAsking(true);
            if (audioRef.current) {
              audioRef.current.volume = 0.1;
              audioRef.current.src = genBgm(); // Set the source for the audio
              audioRef.current.play(); // Play the audio
            }
          }}
          disabled={asking || recording}
        >
          Ask
        </Button>
      )}

      {recording && (
        <Button
          colorScheme="red"
          rightIcon={<FiXOctagon />}
          onClick={() => {
            stopRecording();
            setAsking(false);
          }}
        >
          Stop Recording
        </Button>
      )}
      {transcribing && (
        <Button isLoading loadingText="Transcribing..."></Button>
      )}

      <audio ref={audioRef} id="audio" loop controls hidden></audio>
    </div>
  );
};

export default Ask;

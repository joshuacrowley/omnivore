import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import {
  CircularProgress,
  CircularProgressLabel,
  SlideFade,
  Box,
  Button,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { useKitchen } from "../KitchenContext";
import { analyseImage } from "../api/openai/analyseImage";

const VideoFeedComponent: React.FC = () => {
  const { shoppingList, handleBoughtChange, loading, error } = useKitchen();

  const webcamRef = useRef<Webcam>(null);
  const [progress, setProgress] = useState(0);
  const [isSampling, setIsSampling] = useState(false);
  const [detectedItem, setDetectedItem] = useState<string | null>(null);
  const { isOpen, onToggle } = useDisclosure();

  //@ts-ignore
  const resizeImage = (
    base64Str: string,
    width: number,
    height: number
  ): Promise<string> => {
    console.log("Resizing image");
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL());
        }
      };
    });
  };

  const startSampling = () => {
    setIsSampling(true);
  };

  const stopSampling = () => {
    setIsSampling(false);
    setProgress(0);
  };

  const capture = useCallback(() => {
    console.log("Capturing image from webcam");
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      resizeImage(imageSrc, 512, 512).then((resizedImage) => {
        const base64Image = resizedImage.split(",")[1];
        console.log("Sending image to analyze");

        analyseImage(base64Image, shoppingList).then((item) => {
          if (item) {
            const detectedShoppingItem = shoppingList.find(
              (shoppingItem) => shoppingItem.id === item
            );
            if (detectedShoppingItem) {
              //@ts-ignore
              setDetectedItem(detectedShoppingItem.item);
              handleBoughtChange(detectedShoppingItem, true);
              onToggle();
            }
          }
        });
      });
    }
  }, [onToggle, shoppingList]);

  useEffect(() => {
    if (!isSampling) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          capture();
          return 0;
        }
        return newProgress;
      });
    }, 1000); // Sample every 3 seconds

    return () => clearInterval(interval);
  }, [isSampling, capture]);

  return (
    <Box>
      <Webcam
        audio={false}
        height={512}
        ref={webcamRef}
        screenshotFormat="image/png"
        width={512}
        videoConstraints={{
          width: 512,
          height: 512,
          facingMode: "user",
        }}
      />
      <CircularProgress value={progress} color="orange.400" thickness="12px">
        <CircularProgressLabel>{progress}%</CircularProgressLabel>
      </CircularProgress>
      {detectedItem && (
        <SlideFade in={isOpen} offsetY="20px">
          <Box
            p="40px"
            color="white"
            mt="4"
            bg="teal.500"
            rounded="md"
            shadow="md"
          >
            {detectedItem}
          </Box>
        </SlideFade>
      )}
      <Flex mt={4}>
        <Button colorScheme="teal" onClick={startSampling} mr={2}>
          Start
        </Button>
        <Button colorScheme="red" onClick={stopSampling}>
          Stop
        </Button>
      </Flex>
    </Box>
  );
};

export default VideoFeedComponent;

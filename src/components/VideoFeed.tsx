import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import {
  CircularProgress,
  SlideFade,
  Box,
  Button,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { useKitchen } from "../KitchenContext";
import { analyseImage } from "../api/openai/analyseImage";
import { FiCamera } from "react-icons/fi";

const VideoFeedComponent = () => {
  const { shoppingList, handleBoughtChange, loading, error } = useKitchen();

  const webcamRef = useRef<Webcam>(null);
  const [progress, setProgress] = useState(0);
  const [isSampling, setIsSampling] = useState(false);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const { isOpen, onToggle } = useDisclosure();

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

        analyseImage(base64Image, shoppingList).then((items) => {
          if (items) {
            const detectedShoppingItems = items
              .map(
                (item) =>
                  shoppingList.find((shoppingItem) => shoppingItem.id === item)
                    ?.item
              )
              .filter(Boolean) as string[];

            if (detectedShoppingItems.length > 0) {
              setDetectedItems(detectedShoppingItems);
              detectedShoppingItems.forEach((item) => {
                const shoppingItem = shoppingList.find(
                  (shoppingItem) => shoppingItem.item === item
                );
                if (shoppingItem) {
                  handleBoughtChange(shoppingItem, true);
                }
              });
              onToggle();
            }
          }
        });
      });
    }
  }, [onToggle, shoppingList, handleBoughtChange]);

  return (
    <Box>
      <Webcam
        audio={false}
        height={150}
        ref={webcamRef}
        screenshotFormat="image/png"
        width={150}
        videoConstraints={{
          width: 512,
          height: 512,
          facingMode: "user",
        }}
      />

      {detectedItems.length > 0 && (
        <SlideFade in={isOpen} offsetY="20px">
          <Box p="40px" mt="4" rounded="md" shadow="md">
            {detectedItems.join(", ")}
          </Box>
        </SlideFade>
      )}
      <Flex mt={4}>
        <Button rightIcon={<FiCamera />} onClick={capture} mr={2}>
          Scan
        </Button>
      </Flex>
    </Box>
  );
};

export default VideoFeedComponent;

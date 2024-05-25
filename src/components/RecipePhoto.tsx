import React, { useState, useEffect, useRef } from "react";
import { Box, Image, useColorModeValue as mode } from "@chakra-ui/react";
import { RecipeItem } from "../api/airtable/Recipe";
import { Attachment } from "airtable";

const RecipePhoto: React.FC<{ recipe: RecipeItem; boxSize: string }> = ({
  recipe,
  boxSize,
}) => {
  const images: Attachment[] = recipe?.photo || [];

  return (
    <Image
      src={images[0]?.url || ""}
      alt={`${recipe.name} illustration`}
      borderRadius="full"
      boxSize={boxSize}
      backgroundColor={mode("gray.100", "gray.700")}
      style={{ filter: "grayscale(100%)" }}
      fallbackSrc="./Circle.svg"
    />
  );
};

export default RecipePhoto;

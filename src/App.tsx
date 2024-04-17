import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { Layout } from "./Layout";
import { RecipeProvider } from "./KitchenContext";

export const App = () => (
  <RecipeProvider>
    <ChakraProvider theme={theme}>
      <Layout />
    </ChakraProvider>
  </RecipeProvider>
);

import * as React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { Layout } from "./layout/Layout";
import { RecipeProvider } from "./KitchenContext";

export const App = () => (
  <RecipeProvider>
    <ChakraProvider theme={theme}>
      <Layout />
    </ChakraProvider>
  </RecipeProvider>
);

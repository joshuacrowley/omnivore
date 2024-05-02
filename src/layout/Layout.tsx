import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiArrowLeft, FiPlus, FiMenu, FiRss } from "react-icons/fi";
import { ColumnHeader, ColumnHeading, ColumnIconButton } from "./Column";
import { Main } from "./Main";
import { Navbar } from "./Navigation";
import { RecipeSidebar } from "./RecipeSidebar";
import { ShoppingSideBar } from "./ShoppingSideBar";
import { ChatSidebar } from "./ChatSidebar";
import { MealsSidebar } from "./MealSidebar";
import { useKitchen } from "../KitchenContext"; // Update import path if necessary
import { AddMeal } from "../components/AddMeal";
import { AddRecipe } from "../components/AddRecipe";
import { AddShopping } from "../components/AddShopping";

export const Layout = () => {
  const [sidebarIsScrolled, setSidebarIsScrolled] = useState(false);
  const [mainIsScrolled, setmMainIsScrolled] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedNav, selectedRecipe, selectedThread, selectedMealPlan } =
    useKitchen(); // Destructure the necessary state and functions from context

  return (
    <Flex height="100vh">
      <Box
        height="full"
        width={{ md: "14rem", xl: "18rem" }}
        display={{ base: "none", lg: "initial" }}
        overflowY="auto"
        borderRightWidth="1px"
      >
        <Navbar />
      </Box>
      <Box
        borderRightWidth="1px"
        width={{ md: "20rem", xl: "24rem" }}
        display={{ base: "none", md: "initial" }}
        overflowY="auto"
        onScroll={(x) => setSidebarIsScrolled(x.currentTarget.scrollTop > 32)}
      >
        <ColumnHeader shadow={sidebarIsScrolled ? "base" : "none"}>
          <HStack justify="space-between" width="full">
            <HStack spacing="3">
              <ColumnIconButton
                onClick={onOpen}
                aria-label="Open Navigation"
                icon={<FiMenu />}
                display={{ md: "inline-flex", lg: "none" }}
              />
              <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                  <Navbar onClose={onClose} />
                </DrawerContent>
              </Drawer>
              <ColumnHeading>{selectedNav}</ColumnHeading>
            </HStack>

            {selectedNav === "Recipes" && <AddRecipe />}
            {selectedNav === "Shopping" && <AddShopping />}
          </HStack>
        </ColumnHeader>

        {selectedNav === "Recipes" && <RecipeSidebar />}
        {selectedNav === "Shopping" && <ShoppingSideBar />}
        {selectedNav === "Meal plan" && <MealsSidebar />}
        {selectedNav === "Chat" && <ChatSidebar />}
      </Box>
      <Box
        bg={useColorModeValue("white", "gray.900")}
        flex="1"
        overflowY="auto"
        onScroll={(x) => setmMainIsScrolled(x.currentTarget.scrollTop > 32)}
      >
        <ColumnHeader shadow={mainIsScrolled ? "base" : "none"}>
          <HStack justify="space-between" width="full">
            <HStack spacing="3">
              <ColumnIconButton
                onClick={onOpen}
                aria-label="Navigate back"
                icon={<FiArrowLeft />}
                display={{ base: "inline-flex", md: "none" }}
              />

              {mainIsScrolled && selectedNav === "Recipes" && (
                <ColumnHeading>{selectedRecipe.name}</ColumnHeading>
              )}

              {mainIsScrolled && selectedNav === "Meal plan" && (
                <ColumnHeading>{selectedMealPlan.name}</ColumnHeading>
              )}

              {mainIsScrolled && selectedNav === "Chat" && (
                <ColumnHeading>{selectedThread.topic}</ColumnHeading>
              )}
            </HStack>

            {selectedNav === "Recipes" && <AddMeal />}
          </HStack>
        </ColumnHeader>

        {selectedNav === "Shopping" && (
          <ShoppingSideBar display={{ md: "none" }} />
        )}

        <Main maxW="3xl" mx="auto" py="8" px={{ base: "4", md: "8" }} />
      </Box>
    </Flex>
  );
};

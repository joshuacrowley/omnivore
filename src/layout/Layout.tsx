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
import { FiArrowLeft, FiMenu } from "react-icons/fi";
import {
  ColumnHeader,
  ColumnHeading,
  ColumnIconButton,
  ColumnButton,
} from "./Column";
import { Main } from "./Main";
import { Navbar } from "./Navigation";
import { RecipeSidebar } from "./RecipeSidebar";
import { ShoppingSideBar } from "./ShoppingSideBar";
import { ChatSidebar } from "./ChatSidebar";
import { MealsSidebar } from "./MealSidebar";
import { useKitchen } from "../KitchenContext"; // Update import path if necessary
import { AddRecipe } from "../components/AddRecipe";
import { AddShopping } from "../components/AddShopping";
import { AddThread } from "../components/AddThread";

export const Layout = () => {
  const [sidebarIsScrolled, setSidebarIsScrolled] = useState(false);
  const [mainIsScrolled, setmMainIsScrolled] = useState(false);
  const sideBarDisclosure = useDisclosure();
  const NavDisclosure = useDisclosure();

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
                onClick={NavDisclosure.onOpen}
                aria-label="Open Navigation"
                icon={<FiMenu />}
                display={{ md: "inline-flex", lg: "none" }}
              />
              <Drawer
                isOpen={NavDisclosure.isOpen}
                placement="left"
                onClose={NavDisclosure.onClose}
              >
                <DrawerOverlay />
                <DrawerContent>
                  <Navbar onClose={NavDisclosure.onClose} />
                </DrawerContent>
              </Drawer>
              <ColumnHeading>{selectedNav}</ColumnHeading>
            </HStack>
            {selectedNav === "Recipes" && <AddRecipe />}
            {selectedNav === "Shopping" && <AddShopping />}
            {selectedNav === "Chat" && <AddThread />}
          </HStack>
        </ColumnHeader>

        <Box display={{ md: "none", lg: "block" }}>
          {selectedNav === "Recipes" && <RecipeSidebar />}
          {selectedNav === "Shopping" && <ShoppingSideBar />}
          {selectedNav === "Meal plan" && <MealsSidebar />}
          {selectedNav === "Chat" && <ChatSidebar />}
        </Box>

        <Drawer
          isOpen={sideBarDisclosure.isOpen}
          placement="right"
          onClose={sideBarDisclosure.onClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <Box height="full" overflowY="auto">
              <ColumnHeader justifyContent={"space-between"}>
                <ColumnHeading>
                  <Flex direction={"row"} justifyContent={"space-between"}>
                    {selectedNav}
                  </Flex>
                </ColumnHeading>
                {selectedNav === "Recipes" && <AddRecipe />}
                {selectedNav === "Chat" && <AddThread />}
              </ColumnHeader>
              {selectedNav === "Recipes" && (
                <RecipeSidebar onClose={sideBarDisclosure.onClose} />
              )}
              {selectedNav === "Shopping" && <ShoppingSideBar />}
              {selectedNav === "Meal plan" && (
                <MealsSidebar onClose={sideBarDisclosure.onClose} />
              )}
              {selectedNav === "Chat" && (
                <ChatSidebar onClose={sideBarDisclosure.onClose} />
              )}
            </Box>
          </DrawerContent>
        </Drawer>
      </Box>
      <Box
        bg={useColorModeValue("white", "gray.900")}
        flex="1"
        overflowY="auto"
        onScroll={(x) => setmMainIsScrolled(x.currentTarget.scrollTop > 32)}
      >
        <ColumnHeader shadow={mainIsScrolled ? "base" : "none"}>
          <HStack justify="space-between" width="full">
            <HStack spacing="4">
              <ColumnIconButton
                onClick={NavDisclosure.onOpen}
                aria-label="Navigate back"
                icon={<FiArrowLeft />}
                display={{ base: "inline-flex", md: "none" }}
              />
            </HStack>

            {mainIsScrolled && selectedNav === "Recipes" && (
              <ColumnHeading width={{ base: "50%", md: "100%" }}>
                {selectedRecipe ? selectedRecipe.name : ""}
              </ColumnHeading>
            )}

            {mainIsScrolled && selectedNav === "Meal plan" && (
              <ColumnHeading>
                {selectedMealPlan ? selectedMealPlan.name : "No meal selected"}
              </ColumnHeading>
            )}

            {mainIsScrolled && selectedNav === "Chat" && (
              <ColumnHeading>
                {selectedThread ? selectedThread.topic : ""}
              </ColumnHeading>
            )}

            {selectedNav !== "Shopping" && (
              <ColumnButton
                onClick={sideBarDisclosure.onOpen}
                aria-label="All Recipes"
                display={{ base: "inline-flex", md: "none" }}
              >
                {`All ${selectedNav}`}
              </ColumnButton>
            )}
          </HStack>
        </ColumnHeader>

        {selectedNav === "Shopping" && (
          <ShoppingSideBar display={{ md: "none" }} />
        )}

        <Main maxW="3xl" mx="auto" py="8" px={{ base: "6", md: "8" }} />
      </Box>
    </Flex>
  );
};

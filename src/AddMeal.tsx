import React, { useState, useRef } from "react";
import { useRecipe } from "./KitchenContext";
import { processMealPlan } from "./openai/addMeal";
import { MealItem } from "./airtable/Meal";
import { FiPlus } from "react-icons/fi";

import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerFooter,
  FormLabel,
  Select,
  Box,
  Stack,
  Switch,
  FormControl,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

export const ProcessMealPlanForm = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedRecipe, shoppingList, mealPlans } = useRecipe();
  const [loading, setLoading] = useState(false);
  const [useExisting, setUseExisting] = useState(false);
  const [selectedMealPlanId, setSelectedMealPlanId] = useState("");
  const toast = useToast();
  const firstField = useRef(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await processMealPlan(
        selectedRecipe,
        shoppingList,
        useExisting,
        selectedMealPlanId || null
      );
      toast({
        title: "Meal plan processed successfully.",
        description: "Your meal plan has been updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose(); // Close the drawer on success
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Failed to process meal plan",
        description: `Error: ${errorMessage}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button leftIcon={<FiPlus />} onClick={onOpen}>
        Process Meal Plan
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        initialFocusRef={firstField}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Process Meal Plan</DrawerHeader>

          <DrawerBody>
            <Stack spacing="24px">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-existing" mb="0">
                  Use Existing Meal Plan?
                </FormLabel>
                <Switch
                  id="use-existing"
                  onChange={(e) => setUseExisting(e.target.checked)}
                />
              </FormControl>
              {useExisting && (
                <Box>
                  <FormLabel htmlFor="meal-plan-select">
                    Select Meal Plan
                  </FormLabel>
                  <Select
                    id="meal-plan-select"
                    placeholder="Select a meal plan"
                    value={selectedMealPlanId}
                    onChange={(e) => setSelectedMealPlanId(e.target.value)}
                    ref={firstField}
                  >
                    {mealPlans.map((plan: MealItem) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </Select>
                </Box>
              )}
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button isLoading={loading} onClick={handleSubmit}>
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

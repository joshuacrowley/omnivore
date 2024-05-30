import React, { useState, useRef } from "react";
import { useKitchen } from "../KitchenContext";
import { processMealPlan } from "../api/openai/addMeal";
import { MealItem } from "../api/airtable/Meal";
import { FiPlus } from "react-icons/fi";
import {
  Button,
  FormLabel,
  Select,
  Box,
  Stack,
  Switch,
  FormControl,
  useDisclosure,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";

export const AddMeal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    selectedRecipe,
    shoppingList,
    fetchShoppingRecords,
    mealPlans,
    fetchMeals,
    handleNavSelection,
  } = useKitchen();
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
        useExisting,
        selectedMealPlanId || undefined,
        shoppingList
      );
      toast({
        title: "Meal plan processed successfully.",
        description: "Your meal plan has been updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      fetchShoppingRecords();
      await fetchMeals();
      handleNavSelection("Meal plan");
      onClose(); // Close the popover on success
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
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        closeOnBlur={false}
        initialFocusRef={firstField}
      >
        <PopoverTrigger>
          <Button
            size={{ base: "sm", lg: "md" }}
            variant={"outline"}
            rightIcon={<FiPlus />}
            onClick={onOpen}
          >
            Meal plan
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />

          <PopoverBody>
            <Stack spacing="24px">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-existing" mb="0">
                  Add to existing Meal Plan?
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
          </PopoverBody>
          <PopoverFooter
            borderTopWidth="1px"
            display="flex"
            justifyContent="flex-end"
          >
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button isLoading={loading} onClick={handleSubmit}>
              Submit
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default AddMeal;

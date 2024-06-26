import React, { useEffect } from "react";
import {
  Link,
  Stack,
  StackProps,
  Text,
  useColorModeValue as mode,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useKitchen } from "../KitchenContext"; // Update import path if necessary
import { MealItem } from "../api/airtable/Meal";

// Extend StackProps to include an optional onClose prop
interface MealSidebarProps extends StackProps {
  onClose?: () => void;
}

export const MealsSidebar = (props: MealSidebarProps) => {
  const { selectedMealPlan, mealPlans, setSelectedMealPlan, error, loading } =
    useKitchen(); // Destructure the necessary state and functions from context

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading meals!</AlertTitle>
        <AlertDescription>
          There was a problem loading the meals. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <Stack
      spacing={{ base: "16px", lg: "1" }}
      px={{ lg: "3" }}
      py="3"
      {...props}
    >
      {mealPlans.map((meal: MealItem) => (
        <Link
          key={meal.id}
          onClick={() => {
            setSelectedMealPlan(meal);
            if (props.onClose) {
              props.onClose();
            }
          }} // Set the selectedmealId in context
          aria-current={meal.id === selectedMealPlan?.id ? "page" : undefined} // Highlight the current meal
          _hover={{
            textDecoration: "none",
            bg: mode("gray.100", "gray.700"),
          }}
          _activeLink={{ bg: "gray.700", color: "white" }}
          borderRadius={{ lg: "lg" }}
        >
          <Stack
            spacing="1"
            py={{ base: "3", lg: "2" }}
            px={{ base: "3.5", lg: "3" }}
            fontSize="sm"
            lineHeight="1.25rem"
          >
            <Text fontWeight="medium">{meal.name}</Text>
            <Text fontWeight="medium">{meal.date}</Text>
            <Text fontWeight="medium">{meal.recipeNames}</Text>
          </Stack>
        </Link>
      ))}
    </Stack>
  );
};

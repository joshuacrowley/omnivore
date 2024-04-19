import React, { useState } from "react";
import {
  Link,
  Stack,
  StackProps,
  Text,
  Checkbox,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  CircularProgress,
  CircularProgressLabel,
  Switch,
  FormControl,
  FormLabel,
  Flex,
} from "@chakra-ui/react";
import { RecipeItem } from "./airtable/Recipe";
import { ShoppingItem } from "./airtable/Shopping";
import { useRecipe } from "./KitchenContext"; // Update import path if necessary

export const ShoppingSideBar = (props: StackProps) => {
  const { shoppingList, recipes, setSelectedRecipe, loading, error } =
    useRecipe();
  const [showBought, setShowBought] = useState(true);

  // Helper function to find recipe names by ID
  const getRecipeName = (recipeId: string) => {
    const recipe = recipes.find((recipe: RecipeItem) => recipe.id === recipeId);
    return recipe ? recipe.name : "Recipe not found";
  };

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading shopping!</AlertTitle>
        <AlertDescription>
          There was a problem loading the shopping. Please try again later.
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

  // Calculate the percentage of bought items
  const boughtCount = shoppingList.filter(
    (item: ShoppingItem) => item.bought
  ).length;
  const totalItems = shoppingList.length;
  const progressPercent = totalItems > 0 ? (boughtCount / totalItems) * 100 : 0;

  // Group items by category
  const groupedItems = shoppingList.reduce(
    (acc: Record<string, ShoppingItem[]>, item: ShoppingItem) => {
      // Use a default category if the item's category is undefined
      const category = item.category || "Uncategorized";

      acc[category] = acc[category] || [];
      if (showBought || !item.bought) {
        acc[category].push(item);
      }
      return acc;
    },
    {} as Record<string, ShoppingItem[]>
  ); // Cast the initial value as the same type

  return (
    <Stack
      spacing={{ base: "1px", lg: "1" }}
      px={{ lg: "3" }}
      py="3"
      {...props}
    >
      <Flex justifyContent={"space-between"}>
        <CircularProgress value={progressPercent}>
          <CircularProgressLabel>
            {Math.round(progressPercent)}%
          </CircularProgressLabel>
        </CircularProgress>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="show-bought" mb="0">
            Show bought
          </FormLabel>
          <Switch
            id="show-bought"
            isChecked={showBought}
            onChange={() => setShowBought(!showBought)}
          />
        </FormControl>
      </Flex>

      {(Object.entries(groupedItems) as [string, ShoppingItem[]][]).map(
        ([category, items]: [string, ShoppingItem[]], index: number) => (
          <React.Fragment key={category}>
            {index > 0 && <Divider />}
            <Text fontSize="lg" fontWeight="bold" my="4">
              {category}
            </Text>
            {items.map((item: ShoppingItem) => (
              <Stack key={item.id} direction="row" align="center">
                <Checkbox
                  isChecked={item.bought}
                  onChange={(e) => {
                    // Cast the event target type to access the 'checked' property
                    const target = e.target as HTMLInputElement;
                    // Update bought status in the shopping list state
                    // updateItemBought(item.id, target.checked);
                  }}
                >
                  {item.item} ({item.quantity})
                </Checkbox>
              </Stack>
            ))}
          </React.Fragment>
        )
      )}
    </Stack>
  );
};

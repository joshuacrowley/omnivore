import React, { useState } from "react";
import {
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
  Switch,
  FormControl,
  FormLabel,
  Button,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { FiClipboard } from "react-icons/fi";
import { ShoppingItem } from "../api/airtable/Shopping";
import { useKitchen } from "../KitchenContext";
import ShoppingItemScan from "../components/ShoppingItemScan";
import { CopyToClipboard } from "react-copy-to-clipboard";

export const ShoppingSideBar = (props: StackProps) => {
  const {
    shoppingList,
    updateShoppingListItem,
    setShoppingList,
    loading,
    error,
  } = useKitchen();
  const [showBought, setShowBought] = useState(true);
  const [showScan, setShowScan] = useState(false);

  const handleBoughtChange = (item: ShoppingItem, bought: boolean) => {
    // Optimistically update the UI
    const newShoppingList = shoppingList.map((shoppingItem: ShoppingItem) => {
      if (shoppingItem.id === item.id) {
        return { ...shoppingItem, bought: bought };
      }
      return shoppingItem;
    });
    // Update the context state immediately without waiting for airtable
    setShoppingList(newShoppingList);

    // Asynchronously update the backend
    updateShoppingListItem({ id: item.id, fields: { bought } }).catch(
      (error: any) => {
        console.error("Failed to update item:", error);
        // Optionally revert the change in the UI or show an error message
        setShoppingList(shoppingList); // Revert to original state in case of an error
      }
    );
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

  // Prepare the shopping list string for clipboard, preserving order
  const orderedItems = (
    Object.entries(groupedItems) as [string, ShoppingItem[]][]
  ).flatMap(([, items]) => items);
  const shoppingListString = orderedItems
    .map((item) => `${item.item} (${item.quantity})`)
    .join("\n");

  return (
    <Stack
      spacing={{ base: "1px", lg: "1" }}
      px={{ base: "4", lg: "3" }}
      py="3"
      {...props}
    >
      <Stack
        spacing={{ base: "1px", lg: "1" }}
        px={{ base: "4", lg: "3" }}
        py="3"
        {...props}
      >
        <Flex justifyContent={"space-between"} alignItems="center">
          <FormControl display="flex" alignItems="center" width={"auto"}>
            <FormLabel htmlFor="show-bought" mb="0">
              <Text fontSize="sm" my="4">
                Bought
              </Text>
            </FormLabel>
            <Switch
              id="show-bought"
              isChecked={showBought}
              onChange={() => setShowBought(!showBought)}
            />
          </FormControl>
          <CopyToClipboard text={shoppingListString}>
            <IconButton
              aria-label="Copy shopping list"
              icon={<FiClipboard />}
              size="sm"
            />
          </CopyToClipboard>
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
                    onChange={(e) => handleBoughtChange(item, e.target.checked)}
                  >
                    {item.item} ({item.quantity})
                  </Checkbox>
                </Stack>
              ))}
            </React.Fragment>
          )
        )}
      </Stack>
      <Divider />

      {showScan && <ShoppingItemScan />}
      <Button
        display={{ base: "none", lg: "block" }}
        size={"sm"}
        onClick={() => setShowScan(!showScan)}
        my={5}
      >
        {showScan ? "Hide" : "Show"} scan
      </Button>
    </Stack>
  );
};

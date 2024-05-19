import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  FunctionComponent,
} from "react";
import { getRecipeById, getRecipes, RecipeItem } from "./api/airtable/Recipe";
import {
  getShoppingRecords,
  updateShoppingItem,
  ShoppingItem,
  UpdateShoppingItem,
} from "./api/airtable/Shopping";
import { getMeals, MealItem } from "./api/airtable/Meal";
import { EnrichedThread } from "./api/openai/threads";
import { findThreads, getThreadMessages } from "./api/openai/threads";
import { updatedAssistant } from "./api/openai/assistant";

interface KitchenContextType {
  threads: EnrichedThread[];
  setSelectedThread: (thread: EnrichedThread | null) => void;
  fetchThreadMessages: () => Promise<void>;
  selectedThread: EnrichedThread | null;
  messageList: any[]; // Define a proper type based on the data structure of messages
  setMessageList: (messages: any[]) => void; // Define the type for messages
  recipes: RecipeItem[];
  mealPlans: MealItem[];
  shoppingList: ShoppingItem[];
  selectedRecipe: RecipeItem | null;
  setSelectedRecipe: (recipe: RecipeItem | null) => void;
  selectedMealPlan: MealItem | null;
  setSelectedMealPlan: (mealPlan: MealItem | null) => void;
  setShoppingList: (items: ShoppingItem[]) => void;
  selectedNav: "Recipes" | "Shopping" | "Meal plan" | "Chat";
  loading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  fetchRecipeById: (id: string) => Promise<void>;
  fetchShoppingRecords: () => Promise<void>;
  fetchMeals: () => Promise<void>;
  handleNavSelection: (
    navItem: "Recipes" | "Shopping" | "Meal plan" | "Chat"
  ) => void;
  handleBoughtChange: (item: ShoppingItem, bought: boolean) => Promise<void>;
  updateShoppingListItem: (updateData: UpdateShoppingItem) => Promise<void>;
  shortCutActive: boolean;
  setShortCutActive: (active: boolean) => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error("useKitchen must be used within a KitchenContext.Provider");
  }
  return context;
};

export const RecipeProvider: FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const assistant_id = process.env.REACT_APP_ASSISTANT_ID;

  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [shortCutActive, setShortCutActive] = useState(true);
  const [threads, setThreads] = useState<EnrichedThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<EnrichedThread | null>(
    null
  );
  const [messageList, setMessageList] = useState<any[]>([]); // Update with the correct type
  const [mealPlans, setMealPlans] = useState<MealItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealItem | null>(
    null
  );
  const [selectedNav, setSelectedNav] = useState<
    "Recipes" | "Shopping" | "Meal plan" | "Chat"
  >("Recipes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRecipes = await getRecipes();
      console.log("fetchedRecipes", fetchedRecipes);
      setRecipes(fetchedRecipes);
      setError(null);
      if (fetchedRecipes.length > 0 && !selectedRecipe) {
        setSelectedRecipe(fetchedRecipes[0]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
    setLoading(false);
  }, [selectedRecipe]);

  const fetchThreadMessages = useCallback(async () => {
    try {
      // Check if the id is defined
      if (selectedThread?.id === undefined) {
        throw new Error("Thread ID is undefined"); // Or handle this case as you see fit
      }

      const records = await getThreadMessages(selectedThread.id); // Now safely passing a string

      console.log("getThreadMessages", records);
      setMessageList(records);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [selectedThread]);

  const fetchThreads = useCallback(async () => {
    try {
      const records = await findThreads();
      setThreads(records);
      setError(null);

      if (records.length > 0 && !selectedThread) {
        setSelectedThread(records[0]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [selectedThread]);

  const fetchShoppingRecords = useCallback(async () => {
    try {
      const records = await getShoppingRecords();
      console.log("getShoppingRecords", records);
      setShoppingList(records);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, []);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const meals = await getMeals();
      console.log("getMeals", meals);
      setMealPlans(meals);
      setError(null);

      if (meals.length > 0 && !selectedMealPlan) {
        setSelectedMealPlan(meals[0]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
    setLoading(false);
  }, []);

  // Fetch and set a single recipe
  const fetchRecipeById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const fetchedRecipe = await getRecipeById(id);
      setSelectedRecipe(fetchedRecipe);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
    setLoading(false);
  }, []);

  const handleBoughtChange = async (
    item: ShoppingItem,
    bought: boolean
  ): Promise<void> => {
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
    await updateShoppingListItem({ id: item.id, fields: { bought } }).catch(
      (error: any) => {
        console.error("Failed to update item:", error);
        // Optionally revert the change in the UI or show an error message
        setShoppingList(shoppingList); // Revert to original state in case of an error
      }
    );
  };

  const handleNavSelection = useCallback(
    (navItem: "Recipes" | "Shopping" | "Meal plan" | "Chat") => {
      setSelectedNav(navItem);
    },
    []
  );

  const updateShoppingListItem = useCallback(
    async (updateData: UpdateShoppingItem): Promise<void> => {
      try {
        await updateShoppingItem(updateData);
        await fetchShoppingRecords(); // Refresh the shopping list after updating
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    },
    [fetchShoppingRecords]
  );

  useEffect(() => {
    fetchRecipes();
    fetchShoppingRecords();
    fetchMeals();
    fetchThreads();
    fetchThreadMessages();
  }, []);

  useEffect(() => {
    if (assistant_id) {
      updatedAssistant(assistant_id);
    }
  }, [assistant_id]);

  const providerValue: KitchenContextType = {
    threads,
    setSelectedThread,
    fetchThreadMessages,
    selectedThread,
    messageList,
    setMessageList,
    recipes,
    mealPlans,
    shoppingList,
    selectedRecipe,
    setSelectedRecipe,
    selectedMealPlan,
    setSelectedMealPlan,
    setShoppingList,
    selectedNav,
    loading,
    error,
    fetchRecipes,
    fetchRecipeById,
    fetchShoppingRecords,
    fetchMeals,
    handleNavSelection,
    updateShoppingListItem,
    shortCutActive,
    setShortCutActive,
    handleBoughtChange,
  };

  return (
    <KitchenContext.Provider value={providerValue}>
      {children}
    </KitchenContext.Provider>
  );
};

export type { KitchenContextType };

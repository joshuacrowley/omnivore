import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { getRecipeById, getRecipes } from "./api/airtable/Recipe";
import {
  getShoppingRecords,
  updateShoppingItem,
} from "./api/airtable/Shopping"; // Import your API functions
import { getMeals } from "./api/airtable/Meal"; // Import your API functions
import { findThreads, getThreadMessages } from "./api/openai/findThreads";

const KitchenContext = createContext();

export const useKitchen = () => useContext(KitchenContext);

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [selectedNav, setSelectedNav] = useState("Chat"); // This can be "Recipes", "Shopping", "Meal plan"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [selectedRecipe]);

  const fetchThreads = useCallback(async () => {
    try {
      const records = await findThreads();
      console.log("findThreads", records);
      setThreads(records);
      setError(null);

      if (records.length > 0 && !selectedThread) {
        setSelectedThread(records[0]);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchShoppingRecords = useCallback(async () => {
    try {
      const records = await getShoppingRecords();
      console.log("getShoppingRecords", records);
      setShoppingList(records);
      setError(null);
    } catch (err) {
      setError(err.message);
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
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  // Fetch and set a single recipe
  const fetchRecipeById = useCallback(async (id) => {
    setLoading(true);
    try {
      const fetchedRecipe = await getRecipeById(id);
      setSelectedRecipe(fetchedRecipe);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecipes();
    fetchShoppingRecords();
    fetchMeals();
    fetchThreads();
  }, []);

  const handleNavSelection = useCallback((navItem) => {
    setSelectedNav(navItem);
  }, []);

  const updateShoppingListItem = useCallback(
    async (updateData) => {
      try {
        await updateShoppingItem(updateData);
        await fetchShoppingRecords(); // Refresh the shopping list after updating
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    },
    [fetchShoppingRecords]
  );

  useEffect(() => {
    fetchRecipes();
    fetchShoppingRecords();
    fetchMeals();
  }, []);

  const providerValue = {
    threads,
    setSelectedThread,
    selectedThread,
    messageList,
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
  };

  return (
    <KitchenContext.Provider value={providerValue}>
      {children}
    </KitchenContext.Provider>
  );
};

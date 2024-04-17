// RecipeContext.js
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { getRecipeById, getRecipes } from "./airtable/Recipe";
import { getShoppingRecords } from "./airtable/Shopping"; // Import your API functions
import * as meal from "./airtable/Meal"; // Import your API functions

const RecipeContext = createContext();

export const useRecipe = () => useContext(RecipeContext);

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [selectedNav, setSelectedNav] = useState("Recipes"); // This can be "Recipes", "Shopping", "Meal plan"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch and set recipes
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRecipes = await getRecipes();

      console.log("fetchedRecipes", fetchedRecipes);
      setRecipes(fetchedRecipes);

      setError(null);
      // Optionally set the first recipe as the selected recipe if none is selected
      if (fetchedRecipes.length > 0 && !selectedRecipe) {
        setSelectedRecipe(fetchedRecipes[0]);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [selectedRecipe]);

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

  // useEffect hook to fetch recipes when the provider mounts
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Handle navigation selection
  const handleNavSelection = useCallback((navItem) => {
    setSelectedNav(navItem);
  }, []);

  // Context provider value
  const providerValue = {
    recipes,
    mealPlans,
    shoppingList,
    selectedRecipe,
    setSelectedRecipe,
    selectedMealPlan,
    selectedNav,
    loading,
    error,
    fetchRecipes,
    fetchRecipeById,
    // Include all the remaining API functions here
    handleNavSelection,
  };

  return (
    <RecipeContext.Provider value={providerValue}>
      {children}
    </RecipeContext.Provider>
  );
};

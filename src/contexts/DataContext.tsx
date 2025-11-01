import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  InventoryItem,
  StockMovement,
  Purchase,
  Recipe,
  ProductionBatch,
  Sale,
  Expense,
  DashboardStats
} from '../types';

interface DataContextType {
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  purchases: Purchase[];
  recipes: Recipe[];
  productions: ProductionBatch[];
  sales: Sale[];
  expenses: Expense[];
  isLoading: boolean;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => Promise<void>;
  
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => Promise<void>;
  receivePurchase: (id: string) => Promise<void>;
  
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  
  addProduction: (production: Omit<ProductionBatch, 'id' | 'createdAt'>) => Promise<void>;
  
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  
  getDashboardStats: () => DashboardStats;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [productions, setProductions] = useState<ProductionBatch[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        inventoryData,
        movementsData,
        purchasesData,
        recipesData,
        productionsData,
        salesData,
        expensesData
      ] = await Promise.all([
        AsyncStorage.getItem('inventory'),
        AsyncStorage.getItem('stockMovements'),
        AsyncStorage.getItem('purchases'),
        AsyncStorage.getItem('recipes'),
        AsyncStorage.getItem('productions'),
        AsyncStorage.getItem('sales'),
        AsyncStorage.getItem('expenses')
      ]);

      if (inventoryData) setInventory(JSON.parse(inventoryData));
      if (movementsData) setStockMovements(JSON.parse(movementsData));
      if (purchasesData) setPurchases(JSON.parse(purchasesData));
      if (recipesData) setRecipes(JSON.parse(recipesData));
      if (productionsData) setProductions(JSON.parse(productionsData));
      if (salesData) setSales(JSON.parse(salesData));
      if (expensesData) setExpenses(JSON.parse(expensesData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveInventory = async (data: InventoryItem[]) => {
    await AsyncStorage.setItem('inventory', JSON.stringify(data));
    setInventory(data);
  };

  const saveStockMovements = async (data: StockMovement[]) => {
    await AsyncStorage.setItem('stockMovements', JSON.stringify(data));
    setStockMovements(data);
  };

  const savePurchases = async (data: Purchase[]) => {
    await AsyncStorage.setItem('purchases', JSON.stringify(data));
    setPurchases(data);
  };

  const saveRecipes = async (data: Recipe[]) => {
    await AsyncStorage.setItem('recipes', JSON.stringify(data));
    setRecipes(data);
  };

  const saveProductions = async (data: ProductionBatch[]) => {
    await AsyncStorage.setItem('productions', JSON.stringify(data));
    setProductions(data);
  };

  const saveSales = async (data: Sale[]) => {
    await AsyncStorage.setItem('sales', JSON.stringify(data));
    setSales(data);
  };

  const saveExpenses = async (data: Expense[]) => {
    await AsyncStorage.setItem('expenses', JSON.stringify(data));
    setExpenses(data);
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveInventory([...inventory, newItem]);
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    const updated = inventory.map(item =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    await saveInventory(updated);
  };

  const deleteInventoryItem = async (id: string) => {
    await saveInventory(inventory.filter(item => item.id !== id));
  };

  const addStockMovement = async (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const item = inventory.find(i => i.id === movement.itemId);
    if (item) {
      const quantityChange = movement.type === 'in' ? movement.quantity : -movement.quantity;
      await updateInventoryItem(item.id, {
        quantity: item.quantity + quantityChange
      });
    }

    await saveStockMovements([...stockMovements, newMovement]);
  };

  const addPurchase = async (purchase: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    await savePurchases([...purchases, newPurchase]);
  };

  const receivePurchase = async (id: string) => {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase || purchase.status === 'received') return;

    for (const item of purchase.items) {
      const inventoryItem = inventory.find(i => i.id === item.itemId);
      if (inventoryItem) {
        const updatedBatches = inventoryItem.batches || [];
        
        if (item.batchNumber) {
          updatedBatches.push({
            id: Date.now().toString() + Math.random(),
            batchNumber: item.batchNumber,
            quantity: item.quantity,
            expiryDate: item.expiryDate,
            purchaseId: id,
            createdAt: new Date().toISOString()
          });
        }

        await updateInventoryItem(inventoryItem.id, {
          quantity: inventoryItem.quantity + item.quantity,
          costPerUnit: item.unitCost,
          batches: updatedBatches.length > 0 ? updatedBatches : undefined
        });

        await addStockMovement({
          itemId: inventoryItem.id,
          type: 'in',
          quantity: item.quantity,
          reason: 'Purchase Receipt',
          reference: id
        });
      }
    }

    const updated = purchases.map(p =>
      p.id === id ? { ...p, status: 'received' as const } : p
    );
    await savePurchases(updated);
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveRecipes([...recipes, newRecipe]);
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const updated = recipes.map(recipe =>
      recipe.id === id ? { ...recipe, ...updates, updatedAt: new Date().toISOString() } : recipe
    );
    await saveRecipes(updated);
  };

  const deleteRecipe = async (id: string) => {
    await saveRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  const addProduction = async (production: Omit<ProductionBatch, 'id' | 'createdAt'>) => {
    const recipe = recipes.find(r => r.id === production.recipeId);
    if (!recipe) return;

    for (const ingredient of recipe.ingredients) {
      const item = inventory.find(i => i.id === ingredient.itemId);
      if (item) {
        const quantityNeeded = ingredient.quantity * production.quantity;
        await updateInventoryItem(item.id, {
          quantity: item.quantity - quantityNeeded
        });

        await addStockMovement({
          itemId: item.id,
          type: 'out',
          quantity: quantityNeeded,
          reason: 'Production',
          reference: production.recipeId
        });
      }
    }

    if (production.waste) {
      for (const wasteItem of production.waste) {
        await addStockMovement({
          itemId: wasteItem.itemId,
          type: 'out',
          quantity: wasteItem.quantity,
          reason: `Waste: ${wasteItem.reason}`
        });
      }
    }

    const newProduction: ProductionBatch = {
      ...production,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    await saveProductions([...productions, newProduction]);
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    for (const item of sale.items) {
      if (item.itemId) {
        const inventoryItem = inventory.find(i => i.id === item.itemId);
        if (inventoryItem) {
          await updateInventoryItem(inventoryItem.id, {
            quantity: inventoryItem.quantity - item.quantity
          });

          await addStockMovement({
            itemId: inventoryItem.id,
            type: 'out',
            quantity: item.quantity,
            reason: 'Sale'
          });
        }
      }
    }

    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    await saveSales([...sales, newSale]);
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    await saveExpenses([...expenses, newExpense]);
  };

  const getDashboardStats = (): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];

    const todaySales = sales
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + s.total, 0);

    const todayExpenses = expenses
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);

    const inventoryValue = inventory.reduce(
      (sum, item) => sum + item.quantity * item.costPerUnit,
      0
    );

    const lowStockItems = inventory.filter(
      item => item.quantity <= item.reorderLevel
    );

    const expiringItems: Array<{ item: InventoryItem; batch: any }> = [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    inventory.forEach(item => {
      if (item.batches) {
        item.batches.forEach(batch => {
          if (batch.expiryDate) {
            const expiryDate = new Date(batch.expiryDate);
            if (expiryDate <= thirtyDaysFromNow) {
              expiringItems.push({ item, batch });
            }
          }
        });
      }
    });

    return {
      todaySales,
      todayExpenses,
      inventoryValue,
      lowStockItems,
      expiringItems
    };
  };

  return (
    <DataContext.Provider
      value={{
        inventory,
        stockMovements,
        purchases,
        recipes,
        productions,
        sales,
        expenses,
        isLoading,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addStockMovement,
        addPurchase,
        receivePurchase,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addProduction,
        addSale,
        addExpense,
        getDashboardStats
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

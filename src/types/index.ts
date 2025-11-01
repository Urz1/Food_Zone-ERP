export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface InventoryBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate?: string;
  purchaseId?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  costPerUnit: number;
  batches?: InventoryBatch[];
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  batchId?: string;
  createdAt: string;
}

export interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  total: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Purchase {
  id: string;
  supplier: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  status: 'pending' | 'received';
  notes?: string;
  createdAt: string;
}

export interface RecipeIngredient {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  sku: string;
  ingredients: RecipeIngredient[];
  yieldQuantity: number;
  yieldUnit: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionBatch {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  date: string;
  waste?: {
    itemId: string;
    itemName: string;
    quantity: number;
    reason: string;
  }[];
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  itemId?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  todaySales: number;
  todayExpenses: number;
  inventoryValue: number;
  lowStockItems: InventoryItem[];
  expiringItems: Array<{
    item: InventoryItem;
    batch: InventoryBatch;
  }>;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  modal: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Border colors
  border: string;
  borderLight: string;

  // Status colors
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;

  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;

  // Tab colors
  tabActive: string;
  tabInactive: string;

  // Special colors
  shadow: string;
  overlay: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

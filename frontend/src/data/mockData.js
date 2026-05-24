// Premium Mock Retail Data for KiranaIQ Analytics Dashboard

export const AI_INSIGHTS = [
  {
    id: 1,
    type: "positive",
    message: "Demand for Beverage category is predicted to surge by 28% next week due to high seasonal temperature.",
    timestamp: "Just now"
  },
  {
    id: 2,
    type: "warning",
    message: "High stock-out risk (89% probability) detected for 'Refined Sunflower Oil 1L' within 4 days. Reorder now.",
    timestamp: "10 mins ago"
  },
  {
    id: 3,
    type: "neutral",
    message: "Optimal price difference of ₹12 detected for 'Basmati Rice 5kg'. Keeping price at ₹450 yields highest margins.",
    timestamp: "1 hour ago"
  },
  {
    id: 4,
    type: "positive",
    message: "Store #1 (Downtown) achieved 98% stock health score, reducing customer churn by 4% this month.",
    timestamp: "3 hours ago"
  }
];

export const GENERAL_STATS = {
  monthlyRevenue: {
    value: "₹4,82,500",
    change: "+12.4%",
    isPositive: true,
    subtext: "vs previous month"
  },
  predictedDemand: {
    value: "14,840 units",
    change: "+8.2%",
    isPositive: true,
    subtext: "Forecasted next 14 days"
  },
  inventoryRisk: {
    value: "12 products",
    change: "Low stock alert",
    isPositive: false,
    subtext: "Requires immediate attention"
  },
  activeStores: {
    value: "4 Locations",
    change: "100% operational",
    isPositive: true,
    subtext: "Store health optimal"
  }
};

// Historical Sales & Demand Forecast Comparison (Line & Area Charts)
export const HISTORICAL_SALES_DEMAND = [
  { day: "Mon", sales: 240, forecast: 250, inventory: 400 },
  { day: "Tue", sales: 300, forecast: 290, inventory: 380 },
  { day: "Wed", sales: 280, forecast: 310, inventory: 350 },
  { day: "Thu", sales: 350, forecast: 340, inventory: 310 },
  { day: "Fri", sales: 420, forecast: 430, inventory: 280 },
  { day: "Sat", sales: 580, forecast: 550, inventory: 220 },
  { day: "Sun", sales: 650, forecast: 620, inventory: 180 }
];

// Month-on-Month Store Performance (Bar Chart)
export const STORE_PERFORMANCE = [
  { name: "Downtown Store", revenue: 180000, transactions: 1200 },
  { name: "Suburb Branch", revenue: 145000, transactions: 980 },
  { name: "Highway Outlet", revenue: 95000, transactions: 650 },
  { name: "City Mall Kiosk", revenue: 62500, transactions: 420 }
];

// Product Category Distribution (Pie Chart)
export const CATEGORY_DISTRIBUTION = [
  { name: "Groceries", value: 45, color: "#8B5CF6" },
  { name: "Beverages", value: 25, color: "#06B6D4" },
  { name: "Dairy & Eggs", value: 15, color: "#EC4899" },
  { name: "Personal Care", value: 10, color: "#F59E0B" },
  { name: "Household", value: 5, color: "#10B981" }
];

// Low Stock & Inventory Risk Indicators (Product Table)
export const LOW_STOCK_PRODUCTS = [
  {
    id: "PRD-981",
    name: "Refined Sunflower Oil 1L",
    category: "Groceries",
    stock: 12,
    base_price: 180.0,
    price: 165.0,
    lag_7_day_sold: 45,
    risk: "Critical",
    riskColor: "red"
  },
  {
    id: "PRD-234",
    name: "Premium Basmati Rice 5kg",
    category: "Groceries",
    stock: 8,
    base_price: 520.0,
    price: 490.0,
    lag_7_day_sold: 14,
    risk: "Critical",
    riskColor: "red"
  },
  {
    id: "PRD-102",
    name: "Organic Milk Tetrapack 1L",
    category: "Dairy & Eggs",
    stock: 24,
    base_price: 75.0,
    price: 70.0,
    lag_7_day_sold: 84,
    risk: "High",
    riskColor: "orange"
  },
  {
    id: "PRD-456",
    name: "Sparkling Lemonade 300ml",
    category: "Beverages",
    stock: 35,
    base_price: 40.0,
    price: 35.0,
    lag_7_day_sold: 110,
    risk: "Medium",
    riskColor: "yellow"
  },
  {
    id: "PRD-771",
    name: "Disinfectant Handwash 500ml",
    category: "Personal Care",
    stock: 18,
    base_price: 99.0,
    price: 99.0,
    lag_7_day_sold: 21,
    risk: "Medium",
    riskColor: "yellow"
  }
];

// All stock products for main inventory page
export const ALL_PRODUCTS = [
  ...LOW_STOCK_PRODUCTS,
  {
    id: "PRD-111",
    name: "Instant Masala Noodles 70g",
    category: "Groceries",
    stock: 340,
    base_price: 15.0,
    price: 14.0,
    lag_7_day_sold: 290,
    risk: "Safe",
    riskColor: "green"
  },
  {
    id: "PRD-222",
    name: "Chocolate Fudge Biscuit 150g",
    category: "Groceries",
    stock: 180,
    base_price: 30.0,
    price: 28.0,
    lag_7_day_sold: 65,
    risk: "Safe",
    riskColor: "green"
  },
  {
    id: "PRD-333",
    name: "Greek Yogurt Strawberry 100g",
    category: "Dairy & Eggs",
    stock: 48,
    base_price: 60.0,
    price: 55.0,
    lag_7_day_sold: 40,
    risk: "Safe",
    riskColor: "green"
  },
  {
    id: "PRD-444",
    name: "Diet Cola Can 330ml",
    category: "Beverages",
    stock: 120,
    base_price: 40.0,
    price: 38.0,
    lag_7_day_sold: 95,
    risk: "Safe",
    riskColor: "green"
  }
];
